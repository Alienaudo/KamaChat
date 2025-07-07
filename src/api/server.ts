import fastify, { FastifyInstance } from "fastify";
import { authRoutesPlugin } from "../routes/Auth.Route.js";
import 'dotenv/config';
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";
import multipart from '@fastify/multipart';

export function buildApp(prismaClient: PrismaClient): FastifyInstance {

    const app: FastifyInstance = fastify({

        logger: true

    });

    app.register(cookie);

    app.register(multipart);

    app.decorate('prisma', prismaClient);

    app.register(authRoutesPlugin, {

        prefix: '/api/auth'

    });

    return app;

}

