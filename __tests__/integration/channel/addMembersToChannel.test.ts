import { beforeEach, describe, expect, test } from "vitest";
import { prisma, testServer } from "../../vitest.setup";
import { StatusCodes } from "http-status-codes/build/es/status-codes";
import { Response } from "supertest";

describe("Tests for ChannelController method: AddMembers", (): void => {

    const channelName: string = "AddMemberTestChannel";
    let channelId: string;

    beforeEach(async (): Promise<void> => {

        const r: Response = await testServer
            .post("/api/auth/login")
            .send({

                email: "arnaldozo12@gmail.com",
                password: "fwfwfwffefwdadwda",

            })
            .expect(StatusCodes.OK);

        expect(r.headers["set-cookie"]).toBeDefined();

        const createChannel: Response = await testServer
            .post(`/api/channel/create/${channelName}`)
            .send()
            .expect(StatusCodes.CREATED);

        expect(createChannel.body.id).toBeDefined();

        channelId = createChannel.body.id;

    });

    test("Must add new member to channel", async (): Promise<void> => {

        const userId: { id: string } | null = await prisma.user
            .findUnique({

                where: {

                    email: "rogeriao5432@gmail.com"

                },
                select: {

                    id: true

                }

            });

        expect(userId).toBeDefined();

        const reply: Response = await testServer
            .post(`/api/channel/addMember/${channelId}`)
            .send({

                id: userId?.id

            })
            .expect(StatusCodes.OK)
            .expect("Content-Type", /json/);

        expect(reply.body).toBeTypeOf("object");

        expect(reply.body).toHaveProperty("message");
        expect(reply.body.message).toEqual("User added to channel");

        expect(reply.body).toHaveProperty("channel");

        expect(reply.body.channel).toHaveProperty("channelName");
        expect(reply.body.channel.channelName).toBe(channelName);

        expect(reply.body.channel).toHaveProperty("members");
        expect(Array.isArray(reply.body.channel.members)).toBe(true);

        reply.body.channel.members.forEach(member => {

            expect(member).toHaveProperty("id");
            expect(member).toHaveProperty("nick");

        });

    });

});
