import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserProtectRouter } from "../interfaces/UserProtectRoute.Interface.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply } from "fastify/types/reply.js";
import { DoneFuncWithErrOrRes } from "fastify";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { PrismaClient } from "@prisma/client";
import { ProtectRouter } from "../interfaces/ProtectRouter.Interface.js";

declare module 'fastify' {

    interface FastifyRequest {

        user?: UserProtectRouter

    }

};

export class ProtectMiddleware {

    private readonly jwtSecret: string | undefined = process.env.JWT_SECRET;

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public protect: ProtectRouter = async (

        request: FastifyRequest,
        reply: FastifyReply,
        next: DoneFuncWithErrOrRes

    ): Promise<FastifyReply | void> => {

        try {

            if (!this.jwtSecret) throw new Error('Ambiente variable "JWT_SECRET" is not set');

            if (!request.cookies.jwt) {

                console.log("Unauthorized - No Token Provided");

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "Unauthorized - No Token Provided",
                    message: ReasonPhrases.UNAUTHORIZED

                });

            };

            const token: string = request.cookies.jwt;
            console.log("Received token: ", token);

            const decodedToken: JwtPayload = jwt.verify(token, this.jwtSecret) as JwtPayload;

            if (!decodedToken) {

                return reply.status(StatusCodes.UNAUTHORIZED).send({

                    error: "Unauthorized - Invaled Token Provided",
                    message: ReasonPhrases.UNAUTHORIZED

                });

            };

            console.log("User id: ", decodedToken.userId);

            const user: UserProtectRouter | null = await this.prisma.user
                .findUnique({

                    where: {

                        id: decodedToken.userId,

                    },
                    omit: {

                        hashedPassword: true

                    }

                });


            if (!user) {

                console.log("User was not authenticated");

                return reply.status(StatusCodes.FORBIDDEN).send({

                    error: {

                        error: "User was not authenticated",
                        message: ReasonPhrases.FORBIDDEN

                    }

                });

            };

            console.log("User found w/ token: ", user);

            request.user = user;

            return next();

        } catch (error: unknown) {

            if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {

                return reply.status(StatusCodes.NOT_FOUND).send({

                    error: {

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

                error: {

                    default: "Error in ProtectRouter",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                },

            });

        };


    };

};

