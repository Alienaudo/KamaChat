import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import TestAgent from 'supertest/lib/agent';
import { buildApp } from '../src/api/server';
import supertest from 'supertest';

const exec = promisify(execCallback);

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:123@localhost:5433/testDB';

const prisma: PrismaClient = new PrismaClient();

let fastifyApp: FastifyInstance;
export let testServer: TestAgent;

beforeAll(async (): Promise<void> => {

    try {

        await exec('docker-compose up -d db_test');

        await new Promise(resolve => setTimeout(resolve, 5000));

        await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
        await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);

        await exec(`pnpm prisma db push`);

        fastifyApp = buildApp(prisma);
        await fastifyApp.ready();
        testServer = supertest(fastifyApp.server);

    } catch (error) {

        console.error('Error during data base test setup: ', error);
        process.exit(1);

    }

});

beforeEach(async (): Promise<void> => {

    await prisma.user.deleteMany({});

});

afterAll(async (): Promise<void> => {

    await prisma.$disconnect();

    if (fastifyApp) {

        console.log('Fecha o fastify');

        await fastifyApp.close();

    }

    await exec('docker-compose down db_test');

});
