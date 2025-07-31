import { PrismaClient } from "@prisma/client";
import { ChannelController } from "../controller/Channel.Controller.js";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyPluginAsync } from "fastify/types/plugin";
import { protectRouter } from "../../../middlewares/ProtectRouter.Middleware.js";
import { RawServerDefault } from "fastify";

declare module 'fastify' {

    interface FastifyInstance {

        prisma: PrismaClient;

    }

};

class ChannelRoute {

    private channelController: ChannelController;

    constructor(prisma: PrismaClient) {

        this.channelController = new ChannelController(prisma);

    };

    public channelRoutes = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

        fastify.post('/channels', { preHandler: protectRouter }, this.channelController.getChannelsForSidebar);

        fastify.post('/create/:name', {

            preHandler: protectRouter,
            config: {

                rateLimit: {

                    max: 2,
                    timeWindow: '10 minute'

                }

            }

        }, this.channelController.createChannel);

        fastify.put('/update/picture/:id', {

            preHandler: protectRouter,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '35 minute'

                }

            }


        }, this.channelController.updateChannelPic);

        fastify.put('/update/name', {

            preHandler: protectRouter,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '30 minute'

                }

            }


        }, this.channelController.updateChannelName);


        fastify.post('/addMember/:id', { preHandler: protectRouter }, this.channelController.addMembersToChannel);

    };

};

export const ChannelRoutePlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;
    const channelRoutesInstance: ChannelRoute = new ChannelRoute(prismaInstance);
    await channelRoutesInstance.channelRoutes(fastify);

};

