import { Queue } from "bullmq";
import { redisConnection } from "../../../lib/redis.js";
import { ProfImageJobData } from "../../../interfaces/Prof.ImageJobData.Interface.js";

export const ProfImageProcessingQueue: Queue = new Queue<ProfImageJobData>('image-processing', {

    connection: redisConnection

});

