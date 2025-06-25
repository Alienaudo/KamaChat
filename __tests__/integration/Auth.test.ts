import { describe, test, expect } from "vitest";
import { Response } from "supertest";
import { testServer } from "../vitest.setup";

describe('Tests for User method: Signup', (): void => {

    const user = {

        "name": "test",
        "email": "testtests@gmail.com",
        "password": "fwfwfwffefwdadwda"

    };

    test('Must register the valid user in database', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/signup')
            .send(user)
            .expect(201)
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

    test('Try pass a short password', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/signup')
            .send({ ...user, password: "test" })
            .expect(400)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('errors');
        expect(reply.body.errors).toHaveProperty('message');
        expect(reply.body.errors.message).toBe('password must be at least 6 characters');

    });

    test('Try pass tow users w/ same email', async (): Promise<void> => {

        await testServer
            .post('/api/auth/signup')
            .send(user)
            .expect(201);

        const reply: Response = await testServer
            .post('/api/auth/signup')
            .send(user)
            .expect(400)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('errors');
        expect(reply.body.errors).toHaveProperty('message');
        expect(reply.body.errors.message).toBe('Email already exists');

    });


});
