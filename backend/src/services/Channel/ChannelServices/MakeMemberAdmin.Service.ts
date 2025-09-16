import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { makeMemberAdmin } from "../../../interfaces/Channel.Controller.Interface";

export class MakeMemberAdminService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public make: makeMemberAdmin = async (request: FastifyRequest<{

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

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "Authentication required",
                    message: ReasonPhrases.UNAUTHORIZED

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

            if (member.role === "admin") {

                return reply.status(StatusCodes.CONFLICT).send({

                    error: `Member ${member.user.nick} is already an admin`,
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

                        role: "admin"

                    }

                });

            return reply.status(StatusCodes.OK).send({

                message: `${inviter.user.nick} has made ${member.user.nick} an admin of this group`,

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Channel not found",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            console.error({

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
