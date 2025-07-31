import { ConsumeMessage } from "amqplib";
import { UploadApiResponse } from "cloudinary";
import sharp from "sharp";
import cloudinary from "../../../lib/cloudinary.js";
import { prisma } from "../../../lib/prisma.js";
import { getChannel } from "../../../lib/rabbitmq.js";
import { unlink } from "fs/promises";

const processImage = async (): Promise<void> => {

    const { connection, channel } = await getChannel();

    const queue: string = 'process-channel-pic';

    await channel.assertQueue(queue, { durable: true });

    channel.prefetch(1);

    console.log('✅ Worker started, waiting for jobs in the queue: ', queue);

    channel.consume(queue, async (msg: ConsumeMessage | null): Promise<void> => {

        if (!msg?.content) return;

        let tempFilePath: string | null = null;

        try {

            console.log('📥 Message received. Processing...');

            const data: {

                image: string,
                channelId: bigint

            } = JSON.parse(msg.content.toString());

            console.log('Starting process...');

            const img: Buffer = Buffer.from(data.image, "base64");

            const processedImage: Buffer = await sharp(img)
                .toFormat('avif')
                .toBuffer();

            const updateResponse: UploadApiResponse = await new Promise<UploadApiResponse>((resolve, reject) => {

                const updateStream = cloudinary
                    .uploader
                    .upload_stream({

                        folder: 'channel_pic',
                        resource_type: 'image'

                    }, (error, result) => {

                        if (error) return reject(error);
                        if (result) return resolve(result);

                    });

                updateStream.end(processedImage);

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

            if (!updatedChannel.channelPic) throw new Error('Channel picture not updated');

            console.log('✅ Work successfully completed for the channel: ', data.channelId);
            return channel.ack(msg);

        } catch (error: unknown) {

            if (tempFilePath) {

                try {

                    await unlink(tempFilePath);

                } catch (cleanupError) {

                    console.error({

                        message: 'Error cleaning temporary file after failure: ',
                        error: cleanupError

                    });

                };

            };

            channel.nack(msg, false, true);
            console.error({

                message: 'Error processing image: ',
                erro: error

            });

        } finally {

            channel.close();
            connection.close();

        };

    });

};

processImage();
