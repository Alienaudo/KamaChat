import { describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { Response } from "supertest";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases";
import { StatusCodes } from "http-status-codes/build/es/status-codes";

describe('Tests for AuthController method: Login', (): void => {

    test('Must log in', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(StatusCodes.OK)
            .expect('Content-Type', /json/);

        expect(reply.headers).toHaveProperty('set-cookie');

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('id');
        expect(reply.body.id).toBeTypeOf('string');

        expect(reply.body).toHaveProperty('nick');
        expect(reply.body.nick).toBeTypeOf('string');

        expect(reply.body).toHaveProperty('email');
        expect(reply.body.email).toBeTypeOf('string');

    });

    test('Try to log in with a inexistente email', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "testtests@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(StatusCodes.NOT_FOUND)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('error');
        expect(reply.body.error.error).toEqual('User not found');

        expect(reply.body.error).toHaveProperty('message');
        expect(reply.body.error.message).toBe(ReasonPhrases.NOT_FOUND);

    });

    test('Try to log in with wrong password', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "wrongpassword"

            })
            .expect(StatusCodes.UNAUTHORIZED)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('error');
        expect(reply.body.error.error).toBe('Wrong password');

        expect(reply.body.error).toHaveProperty('message');
        expect(reply.body.error.message).toBe(ReasonPhrases.UNAUTHORIZED);

    });

});
