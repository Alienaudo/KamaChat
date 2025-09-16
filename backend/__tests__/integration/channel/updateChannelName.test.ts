import { beforeEach, describe, expect, test } from "vitest";
import { testServer } from "../../vitest.setup";
import { StatusCodes } from "http-status-codes/build/es/status-codes";
import { Response } from "supertest";

describe("Tests for ChannelController method: UpdateChannelName", (): void => {

    const channelName: string = "ChannelName";
    let channelId: string;

    beforeEach(async (): Promise<void> => {

        const r: Response = await testServer
            .post("/api/auth/login")
            .send({

                email: "arnaldozo12@gmail.com",
                password: "fwfwfwffefwdadwda",

            })
            .expect(StatusCodes.OK); // Login

        expect(r.headers["set-cookie"]).toBeDefined();

        const createChannel: Response = await testServer
            .post(`/api/channel/create/${channelName}`)
            .send()
            .expect(StatusCodes.CREATED);

        expect(createChannel.body.id).toBeDefined();

        channelId = createChannel.body.id;

    });


    test("Must update the channel's name", async (): Promise<void> => {

        const reply: Response = await testServer
            .put("/api/update/name")
            .send({

                id: channelId,
                newName: "UpdatedChannelName"

            })
            .expect(StatusCodes.OK)
            .expect('Content-Type', /json/);

        expect(reply.body).toBeTypeOf("object");

        expect(reply.body).toHaveProperty("message");
        expect(reply.body.message).toEqual("Name updated successfully");

        expect(reply.body).toHaveProperty("channel");

        expect(reply.body.channel).toHaveProperty("id");
        expect(reply.body.channel.id).toBe(channelId);

        expect(reply.body.channel).toHaveProperty("name");
        expect(reply.body.channel.name).toBe("UpdatedChannelName");

    });

});
