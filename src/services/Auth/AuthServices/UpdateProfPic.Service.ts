import { FastifyRequest } from "fastify/types/request";
import { updatePic } from "../../../interfaces/Auth.Interface.js";
import { FastifyReply } from "fastify/types/reply";
import { SignupRequestBody } from "../../../interfaces/SignupRequestBody.Interface.js";
import { saveTemporaryFile } from "../../../utils/fileSaver.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { getChannel } from "../../../lib/rabbitmq.js";
import { readFile, unlink } from "fs/promises";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export class UpdateProfPicService {

    public update: updatePic = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        try {

            const tempFile: string = await saveTemporaryFile(request);
            const profId: string | undefined = request.user?.id;

            if (!profId) {

                console.error("User ID is required");

                return reply.status(StatusCodes.BAD_REQUEST).send({

                    error: {

                        error: "User ID is required",
                        message: ReasonPhrases.BAD_REQUEST

                    }

                });

            };

            const { channel } = await getChannel();

            const queue: string = 'process-profile-pic';

            channel.assertQueue(queue, { durable: true });

            const img: Buffer = await readFile(tempFile);

            const msg: string = JSON.stringify({

                profId: profId,
                image: img.toString("base64")

            });

            channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });

            await unlink(tempFile);

            return reply.status(StatusCodes.ACCEPTED).send({

                message: "Your profile picture is being processed."

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                console.error("User not found");

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: {

                        error: "User not found",
                        message: ReasonPhrases.NOT_FOUND

                    }

                });

            };

            console.error({

                message: "Error during update profile picture",
                error: error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: {

                    default: "Error during update profile picture",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                }

            });

        };

    };

};
