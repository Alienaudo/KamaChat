import { Message, PrismaClient } from "@prisma/client";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface.js";
import { MessageParam } from "../../../interfaces/Message.Param.Interface.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply } from "fastify/types/reply.js";
import { getMessages, getUsersForSidebar } from "../../../interfaces/Message.Controller.Interface.js";
import 'dotenv/config.js'

export class MessageController {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public getUsersForSidebar: getUsersForSidebar = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        try {

            const loggedInId: string | undefined = request.user?.id;

            if (!loggedInId) throw new Error("User ID not found");

            const filteredUsers: UserProtectRouter[] = await this.prisma
                .user
                .findMany({

                    where: {

                        id: {

                            not: {

                                equals: loggedInId

                            }

                        }

                    },

                    omit: {

                        hasedPassword: true

                    },

                    take: 5

                });

            return reply.status(200).send(filteredUsers);

        } catch (error: unknown) {

            console.error(error);

            return reply.status(500).send({

                errors: {

                    default: "Error during find users for the sidebar"

                }

            });

        }

    };

    public getMessages: getMessages = async (request: FastifyRequest<{ Params: MessageParam }>, reply: FastifyReply): Promise<void> => {

        try {

            const userToChatId: string | undefined = request.params.id;
            const myId: string | undefined = request.user?.id;

            if (!userToChatId) throw new Error("User ID not found");
            if (!myId) throw new Error("User ID not found");

            const messages: Message[] = await this.prisma
                .message
                .findMany({

                    where: {

                        OR: [{

                            senderId: { equals: myId },
                            receiverId: { equals: userToChatId }

                        },
                        {

                            senderId: { equals: userToChatId },
                            receiverId: { equals: myId }

                        }]

                    }

                });

            return reply.status(200).send(messages);


        } catch (error: unknown) {

            console.error(error);

            return reply.status(500).send({

                errors: {

                    default: "Error during get messages"

                }

            });


        }

    };
    /*
        public sendMessage = async (request: FastifyRequest<{
    
            Body: MessageBody,
            Params: MessageParam
    
        }>, reply: FastifyReply): Promise<void> => {
    
            try {
    
                const { text, media, mediaType } = request.body;
                const receiverId: string | undefined = request.params.id;
                const senderId: string | undefined = request.user?.id;
    
                if (!text && !media) throw new Error('Need at least a text or an image');
                if (media && !mediaType) throw new Error('Media need a type. Ex.: image, video, audio');
                if (!receiverId) throw new Error("Receiver ID not found");
                if (!senderId) throw new Error("User ID not found");
    
                if (media) {
    
                    switch (mediaType) {
    
                        case 0: // image
    
                            break;
    
                        case 1: // video
    
                            break;
    
                        case 2: // audio
    
                            break;
    
                        default:
                            break;
    
                    }
    
                    const tempFilePath: string = await saveTemporaryFile(request);
    
                    const jobData: MessageImageJobData = {
    
                        image: tempFilePath,
                        senderId: senderId,
    
                    };
    
                    const job = await MessageImageProcessingQueue.add('process-message-pic', jobData);
    
                    console.log(`Task to process user image ${senderId} added to queue.`);
    
                    reply.status(202).send({
    
                        message: "Your picture is being processed."
    
                    });
    
                    const newMessage: Message = await this.prisma.message
                        .create({
    
                            data: {
    
                                senderId: senderId,
                                receiverId: receiverId,
                                text: text,
                                image: await job.returnvalue,
    
                            }
    
                        });
    
                    return reply.status(201).send(newMessage);
    
                }
    
                const newMessage: Message = await this.prisma.message
                    .create({
    
                        data: {
    
                            senderId: senderId,
                            receiverId: receiverId,
                            text: text,
                            image: null,
    
                        }
    
                    });
    
                return reply.status(201).send(newMessage);
    
            } catch (error: unknown) {
    
                console.error(error);
    
                return reply.status(500).send({
    
                    errors: {
    
                        default: "Error during send the message"
    
                    }
    
                });
    
            }
    
        };
    */
};
