import { Job, Worker } from "bullmq";
import { MessageImageJobData } from "../../../interfaces/Message.ImageJobData.Interface.js";
import { convertImageToWebP } from "../../../lib/convertWebp.js";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../../lib/cloudinary";
import fs from 'fs';
import { redisConnection } from "../../../lib/redis.js";

const worker: Worker = new Worker<MessageImageJobData>('image-processing', async (job: Job<MessageImageJobData>): Promise<string> => {

    const { image, senderId } = job.data;
    let convertedImagePath: string | undefined;

    console.log(`Processing image for user: ${senderId}. File: ${image}`);

    try {

        convertedImagePath = await convertImageToWebP(image, 75);

        const updateResponse: UploadApiResponse = await cloudinary
            .uploader
            .upload(convertedImagePath, {

                folder: 'message_images',
                resource_type: 'image'

            });

        const imgeUrl: string = updateResponse.secure_url;

        console.log(`User image ${senderId} successfully processed and updated!`);

        return imgeUrl;

    } catch (error: unknown) {

        console.error(`Failed to process job ${job.id} for user ${senderId}: `, error);
        throw error;

    } finally {

        if (fs.existsSync(image)) {

            fs.unlinkSync(image);
            console.log(`Original temporary file removed: ${image}`);

        }

        if (convertedImagePath && fs.existsSync(convertedImagePath)) {

            fs.unlinkSync(convertedImagePath);
            console.log(`Converted temporary file removed: ${convertedImagePath}`);

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

console.log("Image process started...");
