import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { buildApp } from "./server.js";

const HOST: string = process.env.HOST || 'localhost';
const PORT: number = Number(process.env.PORT || 3000);

const app: FastifyInstance = buildApp(prisma);

try {

    app.listen({

        host: HOST,
        port: PORT

    }, (): void => {

        console.log(`Running at http://${HOST}:${PORT}/`);

    });

} catch (error: unknown) {

    if (app.log) {

        app.log.error(error);

    }

    console.error(error);

    process.exit(1);

}

