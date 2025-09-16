import { PrismaClient } from "@prisma/client";
import { ChannelController } from "../controller/Channel.Controller.js";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyPluginAsync } from "fastify/types/plugin";
import { RawServerDefault } from "fastify";
import { ProtectMiddleware } from "../../../middlewares/ProtectRouter.Middleware.js";
import { type } from "arktype";

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
            schema: {

                params: type({

                    name: "string <= 25"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            },
            config: {

                rateLimit: {

                    max: 2,
                    timeWindow: '10 minute'

                }

            }

        }, this.channelController.createChannel);

        fastify.put('/update/picture/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                params: type({

                    id: "number"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            },
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '35 minute'

                }

            }

        }, this.channelController.updateChannelPic);

        fastify.put('/update/name', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                params: type({

                    id: "number",
                    name: "string <= 25"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            },
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '30 minute'

                }

            }

        }, this.channelController.updateChannelName);

        fastify.put('/update/description', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "number",
                    name: "string <= 25",
                    description: "string <= 300"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            },
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '30 minute'

                }

            }
        }, this.channelController.updateChannelDescription);

        fastify.post('/addMember/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "string"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            }

        }, this.channelController.addMembersToChannel);

        fastify.post('/turnInToAdmin/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "string"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            }

        }, this.channelController.makeMemberAdmin);

        fastify.post('/turnInToMember/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "string"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            }

        }, this.channelController.makeAdminMember);

        fastify.delete('/removeMember/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "string"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            }

        }, this.channelController.removeMember);

        fastify.delete('/deleteChannel/:id', {

            preHandler: this.protectMiddleware.protect,
            schema: {

                body: type({

                    id: "string"

                })
                    .toJsonSchema({

                        dialect: "http://json-schema.org/draft-07/schema",

                    }),

            }

        }, this.channelController.deleteChannel);

    };

};

export const ChannelRoutePlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;

    const protectMiddlewareInstance: ProtectMiddleware = new ProtectMiddleware(prismaInstance);

    const channelRoutesInstance: ChannelRoute = new ChannelRoute(prismaInstance, protectMiddlewareInstance);

    await channelRoutesInstance.channelRoutes(fastify);

};

