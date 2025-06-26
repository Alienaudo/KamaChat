import { beforeAll, describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { Response } from "supertest";

describe('Tests for AuthController method: Login', (): void => {

    beforeAll(async (): Promise<void> => {

        await testServer
            .post('/api/auth/signup')
            .send({

                "name": "Arnaldo Romario",
                "email": "arnaldozo12@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(201);

    });

    test('Must log in', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('id');
        expect(reply.body.id).toBeTypeOf('string');

        expect(reply.body).toHaveProperty('name');
        expect(reply.body.name).toBeTypeOf('string');

        expect(reply.body).toHaveProperty('email');
        expect(reply.body.email).toBeTypeOf('string');

        expect(reply.body).toHaveProperty('profilePic');

    });

    test('Try to log in with a inexistente email', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "testtests@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(404)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('errors');
        expect(reply.body.errors).toHaveProperty('message');
        expect(reply.body.errors.message).toBe('User not found');

    });

    test('Try to log in with wrong password', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "wrongpassword"

            })
            .expect(404)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('errors');
        expect(reply.body.errors).toHaveProperty('message');
        expect(reply.body.errors.message).toBe('Wrong password');

    });

});
