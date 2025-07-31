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

            if (!userId) throw new Error("User ID not found");

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

            if (!channels || channels.length < 1 || channels === undefined) throw new Error("No channels where found");

            return reply.status(StatusCodes.OK).send(channels);

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
