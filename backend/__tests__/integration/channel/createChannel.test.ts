import { beforeEach, describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { StatusCodes } from "http-status-codes/build/es/status-codes.js";
import { ReasonPhrases } from "http-status-codes/build/es/reason-phrases.js";
import { Response } from "supertest";

describe("Tests for ChannelController method: CreateChannel", (): void => {

    let channelName: string;

    beforeEach(async (): Promise<void> => {

        const r = await testServer
            .post("/api/auth/login")
            .send({

                email: "arnaldozo12@gmail.com",
                password: "fwfwfwffefwdadwda",

            })
            .expect(StatusCodes.OK);

        expect(r.headers["set-cookie"]).toBeDefined();

    });

    test("Must create a new channel", async (): Promise<void> => {

        channelName = "TestChannel_01";

        const reply: Response = await testServer
            .post(`/api/channel/create/${channelName}`)
            .send()
            .expect(StatusCodes.CREATED)
            .expect("Content-Type", /json/);

        expect(reply.body).toBeTypeOf("object");

        expect(reply.body).toHaveProperty("message");
        expect(reply.body.message).toEqual(ReasonPhrases.CREATED);

        expect(reply.body).toHaveProperty("name");
        expect(reply.body.name).toEqual(channelName);

        expect(reply.body).toHaveProperty("pic");

    });

});
