import { FastifyReply, FastifyRequest } from "fastify";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import { generateToken } from "../utils/generateToken.js";
import { SignupRequestBody } from "../interfaces/SignupRequestBody.Interface.js";
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";

class AuthController {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public singup = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const { name, email, password } = request.body;

        if (!name || !email || password) {

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
                memoryCost: 1024,
                timeCost: 3,
                parallelism: 2

            })

            const newUser = await this.prisma
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


    public login = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        reply.send("login route");

    };

    public logout = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        reply.send("logout route");

    };

};

export default AuthController;
