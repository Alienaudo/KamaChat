import { PrismaClient, Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { filterXSS } from "xss";
import { logger } from "../../../logger/pino.js";

export class UpdateChannelNameService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public update = async (request: FastifyRequest<{

        Body: {

            id: bigint
            newName: string

        }

    }>, reply: FastifyReply): Promise<FastifyReply> => {

        try {

            const memberId: string | undefined = request.user?.id;
            const channelId: bigint = request.body.id;
            const newName: string = request.body.newName;

            if (!memberId) {

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "User not authenticated",
                    message: ReasonPhrases.UNAUTHORIZED

                });

            };

            const membership: { role: Role } | null = await this.prisma.channelMember
                .findUnique({

                    where: {

                        channelId_userId: {

                            channelId: channelId,
                            userId: memberId

                        }

                    },
                    select: {

                        role: true

                    }

                });

            if (!membership || membership.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Only an admin can change the channel's name",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const updatedName: { name: string } = await this.prisma.channel
                .update({

                    where: {

                        id: channelId,

                    },
                    data: {

                        name: filterXSS(newName)

                    },
                    select: {

                        name: true

                    }

                });

            return reply.status(StatusCodes.OK).send({

                message: "Name updated successfully",
                channel: {

                    id: channelId.toString(),
                    name: updatedName.name

                }

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {

                logger.error(error);

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Channel not found",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            logger.error({

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
