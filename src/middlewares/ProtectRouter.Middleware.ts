import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserProtectRouter } from "../interfaces/UserProtectRoute.Interface.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply } from "fastify/types/reply.js";
import { DoneFuncWithErrOrRes } from "fastify";
import { ProtectRouter } from "../interfaces/ProtectRouter.Interface.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";

declare module 'fastify' {

    interface FastifyRequest {

        user?: UserProtectRouter

    }

};

const jwtSecret: string | undefined = process.env.JWT_SECRET;

if (!jwtSecret) {

    throw new Error('Ambiente variable "JWT_SECRET" is not set');

};

export const protectRouter: ProtectRouter = async (request: FastifyRequest, reply: FastifyReply, next: DoneFuncWithErrOrRes): Promise<void> => {

    try {

        const token: string | undefined = request.cookies.jwt;

        if (!token) {

            return reply.status(StatusCodes.UNAUTHORIZED).send({

                message: "Unauthorized - No Token Provided"

            });

        };

        const decodedToken: JwtPayload = jwt.verify(token, jwtSecret) as JwtPayload;

        if (!decodedToken) {

            return reply.status(StatusCodes.UNAUTHORIZED).send({

                message: "Unauthorized - Invaled Token Provided"

            });

        };

        const user: UserProtectRouter = await prisma
            .user
            .findUniqueOrThrow({

                where: {

                    id: decodedToken.userId

                },

                omit: {

                    hashedPassword: true

                }

            });

        request.user = user;

        return next();

    } catch (error: unknown) {

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {

            console.error("User not found");

            return reply.status(StatusCodes.NOT_FOUND).send({

                errors: {

                    error: "User not found",
                    message: ReasonPhrases.NOT_FOUND

                }

            });


        };

        console.error({

            message: "Error in ProtectRouter: ",
            error: error

        });

        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

            errors: {

                default: "Error in ProtectRouter",
                message: ReasonPhrases.INTERNAL_SERVER_ERROR

            },

        });

    };

};
