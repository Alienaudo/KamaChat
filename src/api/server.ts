import fastify, { FastifyError } from "fastify";
import { authRoutesPlugin } from "../services/Auth/route/Auth.Route.js";
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";
import multipart from '@fastify/multipart';
import fastifyRateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify/types/instance.js";
import { ChannelRoutePlugin } from "../services/Channel/route/Channel.Route.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply, ReplyGenericInterface } from "fastify/types/reply.js";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import "dotenv/config.js";

export function buildApp(prismaClient: PrismaClient): FastifyInstance {

    const app: FastifyInstance = fastify({

        logger: true

    });

    app.setErrorHandler((

        error: FastifyError,
        _request: FastifyRequest,
        reply: FastifyReply

    ): FastifyReply<ReplyGenericInterface> => {

        app.log.error(error);

        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({

            error: ReasonPhrases.INTERNAL_SERVER_ERROR,
            message: error.message

        });

    });

    app.register(cookie, {

        secret: process.env.JWT_SECRET,
        hook: "preHandler"

    });

    app.register(fastifyRateLimit, {

        global: false

    });

    app.register(multipart);

    app.decorate('prisma', prismaClient);

    app.register(authRoutesPlugin, {

        prefix: '/api/auth'

    });

    app.register(ChannelRoutePlugin, {

        prefix: '/api/channel'

    });

    return app;

};

