import { Queue } from "bullmq";
import { redisConnection } from "../../../lib/redis.js";
import { MessageImageJobData } from "../../../interfaces/Message.ImageJobData.Interface.js";

export const MessageImageProcessingQueue: Queue = new Queue<MessageImageJobData>('image-processing', {

    connection: redisConnection

});

