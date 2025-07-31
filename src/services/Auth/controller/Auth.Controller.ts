import * as crypto from "crypto";
import * as argon2 from "argon2";
import { generateToken } from "../../../utils/generateToken.js";
import { SignupRequestBody } from "../../../interfaces/SignupRequestBody.Interface.js";
import { PrismaClient, User } from '@prisma/client/default.js';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { prisma } from "../../../lib/prisma.js";
import { login, logout, signup, update } from "../../../interfaces/Auth.Interface.js";
import { saveTemporaryFile } from "../../../utils/fileSaver.js";
import { ProfImageJobData } from "../../../interfaces/Prof.ImageJobData.Interface.js";
import { ProfImageProcessingQueue } from "../queue/ProfImageProcessing.Queue.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply } from "fastify/types/reply.js";

export class AuthController {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public signup: signup = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        try {

            const { name, nick, email, password } = request.body;

            if (!name || !nick || !email || !password) {

                return reply
                    .status(400)
                    .send({

                        error: {

                            message: "All fields are required"

                        },

                    });

            }

            if (password.length < 6) {

                return reply
                    .status(400)
                    .send({

                        error: {

                            message: "password must be at least 6 characters"

                        },

                    });

            }

            const salt: string = crypto
                .randomBytes(32)
                .toString('base64url');

            const hashedPassword: string = await argon2.hash(password, {

                salt: Buffer.from(salt, 'base64url'),
                type: argon2.argon2id,
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 2

            })

            const newUser: User = await this.prisma
                .user
                .create({

                    data: {

                        name: name,
                        nick: nick,
                        email: email,
                        hasedPassword: hashedPassword

                    },

                });

            generateToken(newUser.id, reply);

            return reply.status(201).send({

                id: newUser.id,
                nick: newUser.nick,
                email: newUser.email,
                profilePic: newUser.profilePic

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {

                console.error("Email already exists");

                return reply.status(400).send({

                    error: {

                        message: "Email already exists"

                    }

                });

            }

            console.error(error);

            return reply.status(500).send({

                error: {

                    default: "Error during singup"

                }

            });

        }

    };

    public login: login = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const { email, password } = request.body;

        try {

            const user: User = await prisma
                .user
                .findUniqueOrThrow({

                    where: {

                        email: email

                    }

                });

            const isPasswordCorrect: boolean = await argon2.verify(user.hasedPassword, password);

            if (!isPasswordCorrect) {

                console.error("Wrong password");

                return reply.status(401).send({

                    error: {

                        message: "Wrong password"

                    }

                });

            }

            generateToken(user.id, reply);

            return reply.status(200).send({

                id: user.id,
                nick: user.nick,
                email: user.email,
                profilePic: user.profilePic

            });

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                console.error("User not found");

                return reply.status(401).send({

                    error: {

                        message: "User not found"

                    }

                });

            }

            console.error(error);

            return reply.status(500).send({

                error: {

                    default: "Error during login"

                }

            })

        }

    };

    public logout: logout = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        try {

            reply.cookie("jwt", "", { maxAge: 0 });
            return reply.status(200).send({

                message: "Logged out successfully"

            });

        } catch (error: unknown) {

            console.error(error);

            return reply.status(500).send({

                error: {

                    default: "Error during logout"

                }

            });

        }

    };

    public updateProfPic: update = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        try {

            const tempFilePath: string = await saveTemporaryFile(request);
            const userId: string | undefined = request.user?.id;

            if (!userId) {

                console.error("User ID is required");

                return reply.status(404).send({

                    error: {

                        message: "User ID is required"

                    }

                });

            }

            const jobData: ProfImageJobData = {

                originalPath: tempFilePath,
                userId: userId

            };

            await ProfImageProcessingQueue.add('process-profile-pic', jobData);

            console.log(`Task to process user image ${userId} added to queue.`);

            return reply.status(202).send({

                message: "Your profile picture is being processed."

            });

        } catch (error: unknown) {

            console.error("Error during update profile picture: ", error);

            return reply.status(500).send({

                error: {

                    default: "Error during update profile picture"

                }

            });

        }
    };

};

