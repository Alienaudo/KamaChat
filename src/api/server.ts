import fastify, { FastifyInstance } from "fastify";
import authRoutes from "../routes/Auth.Route.js";
import 'dotenv/config';
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";

export function buildApp(prismaClient: PrismaClient): FastifyInstance {

    const app: FastifyInstance = fastify({

        logger: true

    });

    app.register(cookie);

    app.decorate('prisma', prismaClient);

    app.register(authRoutes, {

        prefix: '/api/auth'

    });

    return app;

}

