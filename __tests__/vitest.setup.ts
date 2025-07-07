import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import TestAgent from 'supertest/lib/agent';
import { buildApp } from '../src/api/server';
import supertest from 'supertest';

vi.setConfig({

    testTimeout: 30000

});

const exec = promisify(execCallback);

process.env.DATABASE_URL = 'postgresql://postgres:123@localhost:5433/testDB';

const prisma: PrismaClient = new PrismaClient();

let fastifyApp: FastifyInstance;
export let testServer: TestAgent;

const waitForDatabase = async (): Promise<void> => {

    let retries: number = 10;

    while (retries > 0) {

        try {

            await prisma.$connect();
            console.log('✅ Database connection successful!');
            await prisma.$disconnect();
            return;

        } catch (error: unknown) {

            retries--;
            console.log(`...Database not ready, retrying in 2s. (${retries} retries left)`);
            await new Promise(res => setTimeout(res, 2000));

        }

    }

    throw new Error("❌ Could not connect to the database.");

};

const cleanupDatabase = async (): Promise<void> => {

    const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    
        SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    
    `;

    const tablesToTruncate = tableNames
        .filter(table => table.tablename !== '_prisma_migrations')
        .map(table => `"public"."${table.tablename}"`)
        .join(', ');

    if (tablesToTruncate) {

        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tablesToTruncate} RESTART IDENTITY CASCADE;`);

    }

};

beforeAll(async (): Promise<void> => {

    await waitForDatabase();

    await exec(`pnpm prisma db push`); //TODO: USe migrations

    fastifyApp = buildApp(prisma);
    await fastifyApp.ready();
    testServer = supertest(fastifyApp.server);

});

beforeEach(async (): Promise<void> => {

    await cleanupDatabase();

});

afterAll(async (): Promise<void> => {

    await prisma.$disconnect();

    if (fastifyApp) {

        console.log('Fecha o fastify');

        await fastifyApp.close();

    }

});
