import { Job, Worker } from "bullmq";
import { ChannelImageJobData } from "../../../interfaces/Channel.ImageJobData.Interface.js";
import { convertImageToWebP } from "../../../lib/convertWebp.js";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../../lib/cloudinary.js";
import { prisma } from "../../../lib/prisma.js";
import { redisConnection } from "../../../lib/redis.js";
import { unlink } from "fs/promises";

export const worker: Worker = new Worker<ChannelImageJobData>('image-processing', async (job: Job<ChannelImageJobData>): Promise<string> => {

    const { channelId, originalPath } = job.data;
    let convertedImagePath: string | undefined;

    try {

        convertedImagePath = await convertImageToWebP(originalPath, 75);

        const updateResponse: UploadApiResponse = await cloudinary
            .uploader
            .upload(convertedImagePath, {

                folder: 'channel_pic',
                resource_type: 'image'

            });

        const updatedChannel = await prisma.channel
            .update({

                where: {

                    id: channelId

                },
                data: {

                    channelPic: updateResponse.secure_url

                },
                select: {

                    channelPic: true

                }

            });

        if (!updatedChannel.channelPic) throw new Error('Channel picture not updated');

        return updatedChannel.channelPic;

    } catch (error: unknown) {

        console.error(`Failed to process job ${job.id} for channel ${channelId}: `, error);
        throw error;

    } finally {

        try {

            if (originalPath) await unlink(originalPath);
            if (convertedImagePath) await unlink(convertedImagePath);

        } catch (cleanupError) {

            console.error('Failed to clean up temporary files:', cleanupError);

        }

    }

}, {

    connection: redisConnection

});

worker.on('failed', (job: Job<any, any, string> | undefined, err: Error): void => {

    console.log(`Task ${job?.id} failed with error: ${err.message}`);

});

worker.on('completed', (job: Job<any, any, string>): void => {

    console.log(`Task ${job.id} completed successfully!`);

});

