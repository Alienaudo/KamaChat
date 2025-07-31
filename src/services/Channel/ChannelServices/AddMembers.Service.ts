import { Channel, PrismaClient, User } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface";
import { addMembersToChannel } from "../../../interfaces/Channel.Controller.Interface";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

export class AddMembersService {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public add: addMembersToChannel = async (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<void> => {

        try {

            const channelId: bigint = request.params.id;
            const inviterId: string | undefined = request.user?.id;
            const memberId: string = request.body.id;

            if (!inviterId) throw new Error('Inviter ID not found');

            const channelExists: Channel | null = await this.prisma.channel
                .findUnique({

                    where: {

                        id: channelId

                    },

                });

            if (!channelExists) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "Channel not found",
                    message: ReasonPhrases.NOT_FOUND

                });

            };

            const inviterMembership = await this.prisma.channelMember
                .findUnique({

                    where: {

                        channelId_userId: {

                            channelId: channelId,
                            userId: inviterId

                        }

                    }

                });

            if (!inviterMembership || inviterMembership.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "User is not an admin of this channel",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const memberExists: User | null = await this.prisma.user
                .findUnique({

                    where: {

                        id: memberId

                    },

                });

            if (!memberExists) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: "User not found",
                    message: ReasonPhrases.NOT_FOUND

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
                                role: 'member'

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
                    members: updatedChannel.members.map(member => ({

                        id: member.user.id,
                        nick: member.user.nick

                    }))

                }

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError) {

                switch (error.code) {

                    case 'P2002':

                        return reply.status(StatusCodes.CONFLICT).send({

                            error: "The user is already in the channel.",
                            message: ReasonPhrases.CONFLICT

                        });

                    case 'P2025':

                        return reply.status(StatusCodes.NOT_FOUND).send({

                            error: "Channel or user not found",
                            message: ReasonPhrases.NOT_FOUND

                        });

                };

            };

            console.error({

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
