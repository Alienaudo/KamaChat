import { ConsumeMessage } from "amqplib";
import { getChannel } from "../../../lib/rabbitmq.js";
import sharp from "sharp";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary/types";
import cloudinary from "../../../lib/cloudinary.js";
import { prisma } from "../../../lib/prisma.js";
import { logger } from "../../../logger/pino.js";

const processImage = async (): Promise<void> => {

    const { channel } = await getChannel();

    const queue: string = "process-profile-pic";

    await channel.assertQueue(queue, { durable: true });

    channel.prefetch(1);

    logger.info(`✅ Worker started, waiting for jobs in the queue: ${queue}`);

    channel.consume(queue, async (msg: ConsumeMessage | null): Promise<void> => {

        if (!msg?.content) return;

        const data: {

            profId: string,
            image: string

        } = JSON.parse(msg.content.toString());

        try {

            const profId: string = data.profId;
            const img: Buffer = Buffer.from(data.image, "base64");

            const finalImage: Buffer = await sharp(img)
                .toFormat("avif")
                .toBuffer();

            const updateResponse: UploadApiResponse = await new Promise<UploadApiResponse>((resolve, reject) => {

                const updateStream = cloudinary
                    .uploader
                    .upload_stream({

                        folder: 'prof_pic',
                        resource_type: 'image'

                    }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined): void => {

                        if (error) return reject(error);
                        if (result) return resolve(result);

                    });

                updateStream.end(finalImage);

            });

            const updatedProf: {

                profilePic: string | null

            } = await prisma.user
                .update({

                    where: {

                        id: profId

                    },
                    data: {

                        profilePic: updateResponse.secure_url

                    },
                    select: {

                        profilePic: true

                    }

                });

            if (!updatedProf.profilePic) throw new Error('Channel picture not updated');

            logger.info(`✅ Work successfully completed for the profile: ${data.profId}`);

            return channel.ack(msg);

        } catch (error: unknown) {

            logger.error({

                message: 'Error processing image: ',
                erro: error

            });

            return channel.nack(msg, false, true);

        };

    });

};

await processImage();
