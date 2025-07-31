import { describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { Response } from "supertest";

describe('Tests for AuthController method: Logout', (): void => {

    test('Must log out', async (): Promise<void> => {

        const reply: Response = await testServer
            .post('/api/auth/logout')
            .send({

                "email": "arnaldozo12@gmail.com",
                "password": "fwfwfwffefwdadwda"

            })
            .expect(200)
            .expect('Set-Cookie', 'jwt=; Max-Age=0; SameSite=Lax')
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf('object');

        expect(reply.body).toHaveProperty('message');
        expect(reply.body.message).toBe('Logged out successfully');

    });

});
