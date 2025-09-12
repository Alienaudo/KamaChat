import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { removeMember } from "../../../interfaces/Channel.Controller.Interface";

export class RemoveMemberService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public remove: removeMember = async (request: FastifyRequest<{

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

                            }

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

                    error: "Only an admin can remove a member",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            if (!member) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "Member not found",
                    message: ReasonPhrases.NOT_FOUND

                });

            };

            this.prisma.channelMember
                .delete({

                    where: {

                        channelId_userId: {

                            channelId: channelId,
                            userId: memberId,

                        }

                    }

                });

            return reply.status(StatusCodes.NO_CONTENT).send({

                message: `${inviter.user.nick} has removed ${member.user.nick} from this channel`,

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Channel not found",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            console.error({

                message: "Failed to remove member",
                channelId: request.body.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to remove member",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
