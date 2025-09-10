import { FastifyRequest } from "fastify/types/request";
import { login } from "../../../interfaces/Auth.Interface.js";
import { FastifyReply } from "fastify/types/reply";
import { PrismaClient } from "@prisma/client/default";
import * as argon2 from "argon2";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { generateToken } from "../../../utils/generateToken.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";

export class LoginService {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public login: login = async (request: FastifyRequest<{

        Body: {

            email: string
            password: string

        }

    }>, reply: FastifyReply): Promise<FastifyReply> => {

        const { email, password } = request.body;

        try {

            const user = await this.prisma.user
                .findUnique({

                    where: {

                        email: email

                    },
                    select: {

                        id: true,
                        nick: true,
                        email: true,
                        hashedPassword: true

                    }

                });

            if (!user) {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: {

                        error: "User not found",
                        message: ReasonPhrases.NOT_FOUND

                    }

                });

            };

            const isPasswordCorrect: boolean = await argon2.verify(user.hashedPassword, password);

            if (!isPasswordCorrect) {

                console.error("Wrong password");

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: {

                        error: "Wrong password",
                        message: ReasonPhrases.UNAUTHORIZED

                    }

                });

            };

            generateToken(user.id, reply);

            return reply.status(StatusCodes.OK).send({

                message: ReasonPhrases.OK,
                id: user.id,
                nick: user.nick,
                email: user.email

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: {

                        error: "User not found",
                        message: ReasonPhrases.NOT_FOUND

                    }

                });

            };

            console.error({

                message: "Error during login",
                error: error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: {

                    default: "Error during login",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                }

            });

        };

    };

};

