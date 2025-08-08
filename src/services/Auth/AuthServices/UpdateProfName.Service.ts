import { PrismaClient } from "@prisma/client";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { SignupRequestBody } from "../../../interfaces/SignupRequestBody.Interface.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { updateName } from "../../../interfaces/Auth.Interface.js";

export class UpdateProfName {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public update: updateName = async (request: FastifyRequest<{

        Body: SignupRequestBody,
        Params: {

            newName: string

        }

    }>, reply: FastifyReply): Promise<void> => {

        try {

            const profId: string | undefined = request.user?.id;
            const newName: string = request.params.newName;

            if (!profId) {

                console.error("User ID is required");

                return reply.status(StatusCodes.BAD_REQUEST).send({

                    error: {

                        error: "User ID is required",
                        message: ReasonPhrases.BAD_REQUEST

                    }

                });

            };

            const updatedProf: { name: string } = await this.prisma.user
                .update({

                    where: {

                        id: profId

                    },
                    data: {

                        name: newName

                    },
                    select: {

                        name: true

                    }

                });

            return reply.status(StatusCodes.CREATED).send({

                message: ReasonPhrases.CREATED,
                newName: updatedProf.name

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                console.error({

                    message: "User not found",
                    error: error.message

                });

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: {

                        error: "User not found",
                        message: ReasonPhrases.NOT_FOUND

                    }

                });

            };

            console.error({

                message: "Error during update profile name",
                error: error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: {

                    default: "Error during update profile name",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                }

            });

        };

    };

};
