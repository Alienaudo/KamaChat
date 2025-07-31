import { Queue } from "bullmq";
import { ChannelImageJobData } from "../../../interfaces/Channel.ImageJobData.Interface.js";
import { redisConnection } from "../../../lib/redis.js";

export const ChannelImageProcessingQueue: Queue = new Queue<ChannelImageJobData>('imge-processing', {

    connection: redisConnection

});
