import fastify from "fastify";
import { authRoutesPlugin } from "../services/Auth/route/Auth.Route.js";
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";
import multipart from '@fastify/multipart';
import fastifyRateLimit from "@fastify/rate-limit";
import { MessageRoutPlugin } from "../services/Message/route/Message.Route.js";
import { FastifyInstance } from "fastify/types/instance.js";
import { ChannelRoutePlugin } from "../services/Channel/route/Channel.Route.js";

export function buildApp(prismaClient: PrismaClient): FastifyInstance {

    const app: FastifyInstance = fastify({

        logger: true

    });

    app.register(cookie);

    app.register(fastifyRateLimit, {

        global: false

    });

    app.register(multipart);

    app.decorate('prisma', prismaClient);

    app.register(authRoutesPlugin, {

        prefix: '/api/auth'

    });

    app.register(MessageRoutPlugin, {

        prefix: '/api/message'

    });

    app.register(ChannelRoutePlugin, {

        prefix: '/api/channel'

    });

    return app;

};

