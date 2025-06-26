import { FastifyReply, FastifyRequest } from "fastify";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import { generateToken } from "../utils/generateToken.js";
import { SignupRequestBody } from "../interfaces/SignupRequestBody.Interface.js";
import { PrismaClient, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import prisma from "../lib/prisma.js";
import { login, logout, signup } from "../interfaces/Auth.Interfaces.js";

class AuthController {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public signup: signup = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const { name, email, password } = request.body;

        if (!name || !email || !password) {

            return reply
                .status(400)
                .send({

                    errors: {

                        message: "All fields are required"

                    },

                });

        }

        try {

            if (password.length < 6) {

                return reply
                    .status(400)
                    .send({

                        errors: {

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
                        email: email,
                        password: hashedPassword

                    },

                });

            generateToken(newUser.id, reply);

            reply.status(201).send({

                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profilePic: newUser.profilePic

            });

        } catch (error) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {

                console.error("Email already exists");

                return reply.status(400).send({

                    errors: {

                        message: "Email already exists"

                    }
                });

            }

            console.error(error);

            reply.status(500).send({

                errors: {

                    default: "Error during singup"

                }

            })

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

            const isPasswordCorrect: boolean = await argon2.verify(user.password, password);

            if (!isPasswordCorrect) {

                console.error("Wrong password");

                return reply.status(404).send({

                    errors: {

                        message: "Wrong password"

                    }

                });
            }

            generateToken(user.id, reply);

            reply.status(200).send({

                id: user.id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic

            });

        } catch (error) {

            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

                console.error("User not found");

                return reply.status(404).send({

                    errors: {

                        message: "User not found"

                    }

                });


            }

            console.error(error);

            reply.status(500).send({

                errors: {

                    default: "Error during login"

                }

            })

        }

    };

    public logout: logout = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        try {

            reply.cookie("jwt", "", { maxAge: 0 });
            reply.status(200).send({

                message: "Logged out successfully"

            });

        } catch (error) {

            console.error(error);

            reply.status(500).send({

                errors: {

                    default: "Error during logout"

                }

            });

        }

    };

};

export default AuthController;
