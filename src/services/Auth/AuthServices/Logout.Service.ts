import { FastifyReply } from "fastify/types/reply";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { logger } from "../../../logger/pino.js";

export class LogoutService {

    public logout = async (reply: FastifyReply): Promise<void> => {

        try {

            reply.cookie("jwt", "", { maxAge: 0 });

            return reply.status(StatusCodes.OK).send({

                message: "Logged out successfully"

            });

        } catch (error: unknown) {

            logger.error({

                message: "Error during logout",
                error

            });

            return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

                error: {

                    default: "Error during logout",
                    message: ReasonPhrases.INTERNAL_SERVER_ERROR

                }

            });

        };

    };

};
