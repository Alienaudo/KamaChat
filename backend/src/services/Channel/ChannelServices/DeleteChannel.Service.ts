import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { deleteChannel } from "../../../interfaces/Channel.Controller.Interface";
import { logger } from "../../../logger/pino.js";

export class DeleteChannelService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public delete: deleteChannel = async (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply> => {

        try {

            const channelId: bigint = request.params.id;
            const memberId: string | undefined = request.user?.id;

            if (!memberId) {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Authentication required",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const member = await this.prisma.channelMember
                .findUnique({

                    where: {

                        channelId_userId: {

                            channelId: channelId,
                            userId: memberId

                        }

                    },
                    select: {

                        user: {

                            select: {

                                nick: true

                            }

                        },
                        role: true

                    }


                });

            if (!member) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "Member not found",
                    message: ReasonPhrases.NOT_FOUND

                });

            };

            if (member.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Only an admin can remove a member",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            this.prisma.channel
                .delete({

                    where: {

                        id: channelId

                    }

                });

            return reply.status(StatusCodes.NO_CONTENT).send({

                message: `${member.user.nick} has removed ${member.user.nick} from this channel`,

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

                message: "Failed to delete channel",
                channelId: request.body.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to delete channel",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
