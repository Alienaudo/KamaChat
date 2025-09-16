import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { makeAdminMember } from "../../../interfaces/Channel.Controller.Interface";
import { logger } from "../../../logger/pino.js";

export class MakeAdminMemberService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public make: makeAdminMember = async (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply> => {

        try {

            const channelId: bigint = request.params.id;
            const inviterId: string | undefined = request.user?.id;
            const memberId: string = request.body.id;

            if (!inviterId) {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Authentication required",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const [inviter, member] = await Promise.all([

                this.prisma.channelMember
                    .findUnique({

                        where: {

                            channelId_userId: {

                                channelId: channelId,
                                userId: inviterId

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


                    }),

                this.prisma.channelMember
                    .findUnique({

                        where: {

                            channelId_userId: {

                                channelId: channelId,
                                userId: memberId,

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

                    })

            ]);

            if (!inviter) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "Member not found",
                    message: ReasonPhrases.NOT_FOUND

                });

            };

            if (inviter.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Only an admin can add new members",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            if (!member) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "Member not found",
                    message: ReasonPhrases.NOT_FOUND

                });

            };

            if (member.role === "member") {

                return reply.status(StatusCodes.CONFLICT).send({

                    error: `Member ${member.user.nick} is already a member`,
                    message: ReasonPhrases.CONFLICT

                });

            };

            await this.prisma.channelMember
                .update({

                    where: {

                        channelId_userId: {

                            channelId: channelId,
                            userId: memberId,

                        }

                    },
                    data: {

                        role: "member"

                    }

                });

            return reply.status(StatusCodes.OK).send({

                message: `${inviter.user.nick} has made ${member.user.nick} an admin of this group`,

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

                message: "Failed to make an admin",
                channelId: request.body.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to make an admin",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
