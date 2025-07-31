import { describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { Response } from "supertest";
import { UserProtectRouter } from "../../../src/interfaces/UserProtectRoute.Interface";

describe('Tests for AuthController method: Login', (): void => {

    test('Must return the users', async (): Promise<void> => {

        // First the user login
        const loginreplyponse: Response = await testServer
            .post('/api/auth/login')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(loginreplyponse.body).toBeTypeOf('object');
        expect(loginreplyponse.body).toHaveProperty('id');
        expect(loginreplyponse.body.id).toBeTypeOf('string');

        expect(loginreplyponse.headers).toHaveProperty('set-cookie');

        // Then get all users
        const reply: Response = await testServer
            .post('/api/message/users')
            .send({

                id: loginreplyponse.body.id

            })
            .set("Cookie", loginreplyponse.headers['set-cookie'])
            .expect(200)
            .expect('Content-Type', /json/);

        expect(Array.isArray(reply.body)).toBe(true);

        const users: UserProtectRouter[] = reply.body;

        expect(users.length).toBeGreaterThan(0);

        users.forEach((user: UserProtectRouter): void => {

            expect(user).toHaveProperty('id');
            expect(user.id).toBeTypeOf('string');

            expect(user).toHaveProperty('name');
            expect(user.name).toBeTypeOf('string');

            expect(user).toHaveProperty('email');
            expect(user.email).toBeTypeOf('string');

            expect(user).toHaveProperty('profilePic');
            expect(user.profilePic).toBeTypeOf('object');

        });

    });

});
