import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface";
import { addMembersToChannel } from "../../../interfaces/Channel.Controller.Interface";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { logger } from "../../../logger/pino.js";

export class AddMembersService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public add: addMembersToChannel = async (request: FastifyRequest<{

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

            const [inviterMembership, memberExists] = await Promise.all([

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

            if (!inviterMembership || inviterMembership.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Only an admin can add new members",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            if (memberExists) {

                return reply.status(StatusCodes.CONFLICT).send({

                    error: `User ${memberExists.user.nick} is already a members`,
                    message: ReasonPhrases.CONFLICT

                });

            };

            const updatedChannel = await this.prisma.channel
                .update({

                    where: {

                        id: channelId

                    },
                    data: {

                        members: {

                            create: {

                                userId: memberId,
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

            return reply.status(StatusCodes.OK).send({

                message: "User added to channel",
                channel: {

                    channelName: updatedChannel.name,
                    members: updatedChannel.members
                        .map(member => ({

                            id: member.user.id,
                            nick: member.user.nick

                        }))

                }

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError) {

                switch (error.code) {

                    case 'P2002':

                        logger.error(error);

                        return reply.status(StatusCodes.CONFLICT).send({

                            error: "The user is already in the channel.",
                            message: ReasonPhrases.CONFLICT

                        });

                    case 'P2025':

                        logger.error(error);

                        return reply.status(StatusCodes.NOT_FOUND).send({

                            error: "Channel or user not found",
                            message: ReasonPhrases.NOT_FOUND

                        });

                };

            };

            logger.error({

                message: "Failed to add a new member to channel",
                channelId: request.body.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to add a new member to channel",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
