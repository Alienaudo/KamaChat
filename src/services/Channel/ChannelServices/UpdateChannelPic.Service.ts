import { PrismaClient, Role } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { saveTemporaryFile } from "../../../utils/fileSaver.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { readFile, unlink } from "fs/promises";
import { getChannel } from "../../../lib/rabbitmq.js";

export class UpdateChannelPicService {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public updatePic = async (request: FastifyRequest<{

        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<void> => {

        try {

            const tempFile: string = await saveTemporaryFile(request);
            const channelId: bigint = request.params.id;
            const memberId: string | undefined = request.user?.id;

            if (!memberId) {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Authentication required",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const inviterMembership: { role: Role } = await this.prisma.channelMember
                .findUniqueOrThrow({

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

            if (inviterMembership.role !== 'admin') {

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: "Only an admin can update channel's picture",
                    message: ReasonPhrases.FORBIDDEN

                });

            };

            const { connection, channel } = await getChannel();

            const queue: string = 'process-channel-pic';

            await channel.assertQueue(queue, { durable: true });

            const img: Buffer = await readFile(tempFile);

            const msg: string = JSON.stringify({

                image: img.toString("base64"),
                channelId: channelId.toString()

            });

            channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

            await channel.close();
            await connection.close();

            await unlink(tempFile);

            return reply.status(StatusCodes.ACCEPTED).send({

                message: "Your channel picture is being processed."

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "User is not a member",
                    message: ReasonPhrases.UNAUTHORIZED

                });

            };

            console.error({

                message: "Failed to update channel picture",
                channelId: request.params.id,
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: "Failed to update channel picture",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            });

        };

    };

};
