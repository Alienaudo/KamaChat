import { PrismaClient } from "@prisma/client";
import { protectRouter } from "../../../middlewares/ProtectRouter.Middleware.js";
import { MessageController } from "../controller/Message.Controller.js";
import { FastifyInstance } from "fastify/types/instance.js";
import { FastifyPluginAsync } from "fastify/types/plugin.js";
import { RawServerDefault } from "fastify";

declare module 'fastify' {

    interface FastifyInstance {

        prisma: PrismaClient;

    }

};

class MessageRoute {

    private messageController: MessageController;

    constructor(prisma: PrismaClient) {

        this.messageController = new MessageController(prisma);

    }

    public messageRouts = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

        fastify.post('/users', { preHandler: protectRouter }, this.messageController.getUsersForSidebar);

        fastify.get('/message/:id', { preHandler: protectRouter }, this.messageController.getMessages);
        /*
                fastify.post('/send/:id', {
        
                    preHandler: protectRouter,
                    config: {
        
                        rateLimit: {
        
                            max: 25,
                            timeWindow: '1 minute'
        
                        }
                    }
        
                }, this.messageController.sendMessage);
        */
    };

}

export const MessageRoutPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;
    const messageRoutsInstance: MessageRoute = new MessageRoute(prismaInstance);
    await messageRoutsInstance.messageRouts(fastify);

};
