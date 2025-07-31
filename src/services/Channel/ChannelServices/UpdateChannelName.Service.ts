import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

export class UpdateChannelNameService {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public update = async (request: FastifyRequest<{

        Body: {

            id: bigint
            newName: string

        }

    }>, reply: FastifyReply): Promise<void> => {

        try {

            const userId: string | undefined = request.user?.id;
            const channelId: bigint = request.body.id;
            const newName: string = request.body.newName;

            if (!userId) {

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "User not authenticated",
                    message: ReasonPhrases.UNAUTHORIZED

                });

            };

            const updatedChannel = await this.prisma.channel
                .update({

                    where: {

                        id: channelId,
                        members: {

                            some: {

                                userId: userId,
                                role: "admin"

                            }

                        }

                    },
                    data: {

                        name: newName

                    },
                    select: {

                        name: true

                    }

                });

            return reply.status(StatusCodes.OK).send({

                message: "Name updated successfully",
                channel: {

                    id: channelId.toString(),
                    name: updatedChannel.name

                }

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError) {

                switch (error.code) {

                    case 'P2025':

                        return reply.status(StatusCodes.FORBIDDEN).send({

                            error: "Channel not found or user lacks permission",
                            message: ReasonPhrases.FORBIDDEN

                        });

                    case 'P2002':

                        return reply.status(StatusCodes.BAD_REQUEST).send({

                            error: "Name is already in use",
                            message: ReasonPhrases.BAD_REQUEST

                        });

                };

            };

            console.error({

                message: "Failed to update channel name",
                channelId: request.body.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to update channel name",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
