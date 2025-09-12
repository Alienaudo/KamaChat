import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/api/server';
import supertest, { Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { logger } from '../src/logger/pino.js';

vi.setConfig({

    testTimeout: 30000

});

const exec = promisify(execCallback);

process.env.DATABASE_URL = 'postgresql://postgres:123@localhost:5433/testDB';

export const prisma: PrismaClient = new PrismaClient();

let fastifyApp: FastifyInstance;
export let testServer: TestAgent<Test>;

const waitForDatabase: () => Promise<void> = async (): Promise<void> => {

    let retries: number = 10;

    while (retries > 0) {

        try {

            await prisma.$connect();
            logger.info('✅ Database connection successful!');
            await prisma.$disconnect();
            return;

        } catch (error: unknown) {

            --retries;
            logger.warn(`...Database not ready, retrying in 2s. (${retries} retries left)`);
            await new Promise(res => setTimeout(res, 2000));

        };

    };

    throw new Error("❌ Could not connect to the database.");

};

const cleanupDatabase: () => Promise<void> = async (): Promise<void> => {

    const tableNames: { tablename: string }[] = await prisma
        .$queryRaw<Array<{ tablename: string }>>`

        SELECT tablename FROM pg_tables WHERE schemaname = 'public';

    `;

    const tablesToTruncate: string = tableNames
        .filter(table => table.tablename !== '_prisma_migrations')
        .map(table => `"public"."${table.tablename}"`)
        .join(', ');

    if (tablesToTruncate) {

        await prisma
            .$executeRawUnsafe(`TRUNCATE TABLE ${tablesToTruncate} RESTART IDENTITY CASCADE;`);

    };

};

beforeAll(async (): Promise<void> => {

    await waitForDatabase();

    await exec(`pnpm prisma migrate dev`);

    fastifyApp = buildApp(prisma);
    await fastifyApp.ready();

    testServer = supertest.agent(fastifyApp.server);

});

beforeEach(async (): Promise<void> => {

    await cleanupDatabase();

    await prisma.user
        .createMany({

            data: [

                {

                    "nick": "TestUser_01",
                    "name": "Arnaldo Romario",
                    "email": "arnaldozo12@gmail.com",
                    "hashedPassword": "$argon2id$v=19$m=65536,t=2,p=2$RGQzNjBFeUV4Y2ZwNEVnVg$FsHEmcBY7oI7h/IBo7X0EQ", //fwfwfwffefwdadwda
                    "profilePic": null

                },
                {

                    "nick": "TestUser_02",
                    "name": "Rogerio Francisco",
                    "email": "rogeriao5432@gmail.com",
                    "hashedPassword": "$argon2id$v=19$m=65536,t=2,p=2$RGQzNjBFeUV4Y2ZwNEVnVg$O4WV6ktshkvc/z8XQlilxw", //dnjsvnsns
                    "profilePic": null

                },
                {

                    "nick": "TestUser_03",
                    "name": "Marcia Pereira",
                    "email": "contactmarsia88@gmail.com",
                    "hashedPassword": "$argon2id$v=19$m=65536,t=2,p=2$RGQzNjBFeUV4Y2ZwNEVnVg$qcIUyPNprfq0uXUsEVhe2A", //dwkdkdnnnne
                    "profilePic": null

                }

            ]

        });

});

afterAll(async (): Promise<void> => {

    await prisma
        .$disconnect();

    if (fastifyApp) {

        logger.info("Closing fastify");

        await fastifyApp.close();

    };

});
