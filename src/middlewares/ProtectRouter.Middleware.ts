import jwt, { JwtPayload } from "jsonwebtoken";
import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { SignupRequestBody } from "../interfaces/SignupRequestBody.Interface";
import UserProtectRouter from "../interfaces/UserProtectRoute.Interface.js";

declare module 'fastify' {

    interface FastifyRequest {

        user?: UserProtectRouter

    }

};

const jwtSecret: string | undefined = process.env.JWT_SECRET;

if (!jwtSecret) {

    throw new Error('Ambiente variable "JWT_SECRET" is not set');

}

export const protectRouter = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply, next: DoneFuncWithErrOrRes): Promise<void> => {

    try {

        const token: string | undefined = request.cookies.jwt;

        if (!token) {

            return reply.status(401).send({

                message: "Unauthorized - No Token Provided"

            });

        }

        const decodedToken: JwtPayload = jwt.verify(token, jwtSecret) as JwtPayload;

        if (!decodedToken) {

            return reply.status(404).send({

                message: "Unauthorized - Invaled Token Provided"

            });

        }

        const user: UserProtectRouter = await prisma
            .user
            .findUniqueOrThrow({

                where: {

                    id: decodedToken.userId

                },

                omit: {

                    password: true

                }

            });

        request.user = user;

        return next();

    } catch (error: unknown) {

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

            console.error("User not found");

            return reply.status(404).send({

                errors: {

                    message: "User not found"

                }

            });


        }

        console.error('Error in ProtectRouter: ', error);

        return reply.status(500).send({

            errors: {

                message: 'Error in ProtectRouter',

            },

        });

    }

};
