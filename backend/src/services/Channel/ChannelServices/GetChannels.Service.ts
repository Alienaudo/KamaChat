import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";
import { getChannelsForSidebar } from "../../../interfaces/Channel.Controller.Interface.js";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { Channel } from "../../../interfaces/Channel.Interface.js";

export class GetChannelsService {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public get: getChannelsForSidebar = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        try {

            const userId: string | undefined = request.user?.id;

            if (!userId) {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Authentication required",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const channels: Channel[] = await this.prisma.channel
                .findMany({

                    where: {

                        members: {

                            some: {

                                userId: userId

                            }

                        }

                    },
                    select: {

                        name: true,
                        channelPic: true

                    },
                    take: 5

                });

            return reply.status(StatusCodes.OK).send({

                message: `Channels for user ${userId}`,
                channels

            });

        } catch (error: unknown) {

            console.error({

                message: "Failed to get channel for the sidebar",
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to get channel for the sidebar",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        }

    };

};
