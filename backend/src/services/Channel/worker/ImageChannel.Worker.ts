import { ConsumeMessage } from "amqplib";
import { UploadApiResponse } from "cloudinary";
import sharp from "sharp";
import cloudinary from "../../../lib/cloudinary.js";
import { prisma } from "../../../lib/prisma.js";
import { getChannel } from "../../../lib/rabbitmq.js";
import { logger } from "../../../logger/pino.js";

const processImage = async (): Promise<void> => {

    const { connection, channel } = await getChannel();

    const queue: string = "process-channel-pic";

    await channel.assertQueue(queue, { durable: true });

    channel.prefetch(1);

    logger.info(`✅ Worker started, waiting for jobs in the queue: queue`);

    channel.consume(queue, async (msg: ConsumeMessage | null): Promise<void> => {

        if (!msg?.content) return;

        try {

            logger.info("📥 Message received. Processing...");

            const data: {

                image: string,
                channelId: bigint

            } = JSON.parse(msg.content.toString());

            logger.info("Starting process...");

            const img: Buffer = Buffer.from(data.image, "base64");

            const finalImage: Buffer = await sharp(img)
                .toFormat("avif")
                .toBuffer();

            const updateResponse: UploadApiResponse = await new Promise<UploadApiResponse>((resolve, reject) => {

                const updateStream = cloudinary
                    .uploader
                    .upload_stream({

                        folder: "channel_pic",
                        resource_type: "image"

                    }, (error, result): void => {

                        if (error) return reject(error);
                        if (result) return resolve(result);

                    });

                updateStream.end(finalImage);

            });

            const updatedChannel: {

                channelPic: string | null

            } = await prisma.channel
                .update({

                    where: {

                        id: data.channelId

                    },
                    data: {

                        channelPic: updateResponse.secure_url

                    },
                    select: {

                        channelPic: true

                    }

                });

            if (!updatedChannel.channelPic) throw new Error("Channel picture not updated");

            logger.info(`✅ Work successfully completed for the channel: data.channelId`);

            return channel.ack(msg);

        } catch (error: unknown) {

            channel.nack(msg, false, true);
            logger.info({

                message: "Error processing image: ",
                erro: error

            });

        } finally {

            channel.close();
            connection.close();

        };

    });

};

await processImage();
