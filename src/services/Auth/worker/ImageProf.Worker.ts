import { Job, Worker } from "bullmq";
import { convertImageToWebP } from "../../../lib/convertWebp.js";
import cloudinary from "../../../lib/cloudinary.js";
import { prisma } from "../../../lib/prisma.js";
import fs from 'fs';
import { UploadApiResponse } from "cloudinary";
import { redisConnection } from "../../../lib/redis.js";
import { ProfImageJobData } from "../../../interfaces/Prof.ImageJobData.Interface.js";

const worker: Worker = new Worker<ProfImageJobData>('image-processing', async (job: Job<ProfImageJobData>): Promise<void> => {

    const { originalPath, userId } = job.data;
    let convertedImagePath: string | undefined;

    console.log(`Processing image for user: ${userId}. File: ${originalPath}`);

    try {

        convertedImagePath = await convertImageToWebP(originalPath, 75);

        const updateResponse: UploadApiResponse = await cloudinary
            .uploader
            .upload(convertedImagePath, {

                folder: 'profile_pic',
                resource_type: 'image'

            });

        await prisma.user.update({

            where: {

                id: userId,
            },
            data: {

                profilePic: updateResponse.secure_url,

            },
            omit: {

                hasedPassword: true

            }

        });

        console.log(`User image ${userId} successfully processed and updated!`);

    } catch (error: unknown) {

        console.error(`Failed to process job ${job.id} for user ${userId}: `, error);
        throw error;

    } finally {

        if (fs.existsSync(originalPath)) {

            fs.unlinkSync(originalPath);
            console.log(`Original temporary file removed: ${originalPath}`);

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
