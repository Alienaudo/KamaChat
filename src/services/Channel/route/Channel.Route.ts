import { PrismaClient } from "@prisma/client";
import { ChannelController } from "../controller/Channel.Controller.js";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyPluginAsync } from "fastify/types/plugin";
import { RawServerDefault } from "fastify";
import { ProtectMiddleware } from "../../../middlewares/ProtectRouter.Middleware.js";

declare module 'fastify' {

    interface FastifyInstance {

        prisma: PrismaClient;

    }

};

class ChannelRoute {

    private readonly channelController: ChannelController;
    private readonly protectMiddleware: ProtectMiddleware;

    constructor(prisma: PrismaClient, protectMiddleware: ProtectMiddleware) {

        this.channelController = new ChannelController(prisma);
        this.protectMiddleware = protectMiddleware;

    };

    public channelRoutes = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

        fastify.post('/channels', {

            preHandler: this.protectMiddleware.protect

        }, this.channelController.getChannelsForSidebar);

        fastify.post('/create/:name', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 2,
                    timeWindow: '10 minute'

                }

            }

        }, this.channelController.createChannel);

        fastify.put('/update/picture/:id', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '35 minute'

                }

            }

        }, this.channelController.updateChannelPic);

        fastify.put('/update/name', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '30 minute'

                }

            }

        }, this.channelController.updateChannelName);


        fastify.post('/addMember/:id', {

            preHandler: this.protectMiddleware.protect

        }, this.channelController.addMembersToChannel);

    };

};

export const ChannelRoutePlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;

    const protectMiddlewareInstance: ProtectMiddleware = new ProtectMiddleware(prismaInstance);

    const channelRoutesInstance: ChannelRoute = new ChannelRoute(prismaInstance, protectMiddlewareInstance);

    await channelRoutesInstance.channelRoutes(fastify);

};

