import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { SignupRequestBody } from "../../../interfaces/SignupRequestBody.Interface.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { signup } from "../../../interfaces/Auth.Interface";
import { PrismaClient } from '@prisma/client/default.js';
import { generateToken } from "../../../utils/generateToken.js";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

export class SignupService {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public signup: signup = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        try {

            const { name, nick, email, password } = request.body;

            if (!name || !nick || !email || !password) {

                return reply
                    .status(StatusCodes.BAD_REQUEST)
                    .send({

                        error: {

                            error: "All fields are required",
                            message: ReasonPhrases.BAD_REQUEST

                        },

                    });

            };

            if (password.length < 6) {

                return reply
                    .status(StatusCodes.BAD_REQUEST)
                    .send({

                        error: {

                            error: "password must be at least 6 characters",
                            message: ReasonPhrases.BAD_REQUEST

                        },

                    });

            };

            const salt: string = crypto
                .randomBytes(32)
                .toString('base64url');

            const hashedPassword: string = await argon2.hash(password, {

                salt: Buffer.from(salt, 'base64url'),
                type: argon2.argon2id,
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 2

            });

            const newUser = await this.prisma.user
                .create({

                    data: {

                        name: name,
                        nick: nick,
                        email: email,
                        hashedPassword: hashedPassword

                    },
                    select: {

                        id: true,
                        nick: true,
                        name: true,
                        email: true,
                        profilePic: true

                    }

                });

            generateToken(newUser.id, reply);

            return reply.status(StatusCodes.CREATED).send({

                message: ReasonPhrases.CREATED,
                id: newUser.id,
                nick: newUser.nick,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {

                console.error({

                    message: "Email or Nickname already exists",
                    error: error.message

                });

                return reply.status(StatusCodes.BAD_REQUEST).send({

                    error: {

                        error: "Email or Nickname already exists",
                        message: ReasonPhrases.BAD_REQUEST

                    }

                });

            };

            console.error({

                message: "Error during singup",
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: {

                    default: "Error during singup",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                }

            });

        };

    };
};
