import { Channel, PrismaClient } from "@prisma/client";
import { createChannel } from "../../../interfaces/Channel.Controller.Interface.js";
import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";
import { generateSnowflakeId } from "../../../utils/GenerateSnowflakeId.Utils.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { filterXSS } from "xss";

export class CreateChannelService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public create: createChannel = async (request: FastifyRequest<{

        Params: {

            name: string

        }

    }>, reply: FastifyReply): Promise<FastifyReply> => {

        try {

            const channelName: string = request.params.name;
            const creatorId: string | undefined = request.user?.id;

            if (!creatorId) {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Authentication required",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const nodeId: bigint = BigInt(process.env.NODE_ID || 1);

            const id: bigint = await generateSnowflakeId(BigInt(process.pid), nodeId, Date.now());

            const newChannel: Channel = await this.prisma.channel
                .create({

                    data: {

                        id: id,
                        name: filterXSS(channelName),
                        members: {

                            create: {

                                userId: creatorId,
                                role: "admin"

                            }

                        }

                    },
                    include: {

                        members: {

                            include: {

                                user: {

                                    select: {

                                        id: true,
                                        nick: true,
                                        profilePic: true

                                    }

                                }

                            }

                        }

                    }

                });

            //TODO: realtime-functionalit w/ sockert.io

            return reply.status(StatusCodes.CREATED).send({

                message: ReasonPhrases.CREATED,
                name: newChannel.name,
                pic: newChannel.channelPic

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {

                console.log(error);

                return reply.status(StatusCodes.CONFLICT).send({

                    error: "Channel already exists",
                    message: ReasonPhrases.CONFLICT

                });

            };

            console.error({

                message: "Failed to create channel",
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to create channel",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
