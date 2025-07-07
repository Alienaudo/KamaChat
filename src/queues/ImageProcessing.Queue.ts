import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { ImageJobData } from "../interfaces/ImageJobData.Interface.js";

export const imageProcessingQueue: Queue = new Queue<ImageJobData>('image-processing', {

    connection: redisConnection

});

