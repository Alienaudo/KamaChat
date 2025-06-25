import prisma from "../lib/prisma.js";
import { buildApp } from "./server.js";

const HOST: string = process.env.HOST || 'localhost';
const PORT: number = Number(process.env.PORT || 3000);

try {

    buildApp(prisma).listen({

        host: HOST,
        port: PORT

    }, (): void => {

        console.log(`Running at http://${HOST}:${PORT}/`);

    });

} catch (error: unknown) {

    buildApp(prisma).log.error(error);
    process.exit(1);

}

