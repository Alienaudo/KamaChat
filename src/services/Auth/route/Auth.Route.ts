import { AuthController } from "../controller/Auth.Controller.js";
import { PrismaClient } from "@prisma/client";
import { protectRouter } from "../../../middlewares/ProtectRouter.Middleware.js";
import { FastifyInstance } from "fastify/types/instance.js";
import { FastifyPluginAsync } from "fastify/types/plugin.js";
import { RawServerDefault } from "fastify";

declare module 'fastify' {

    interface FastifyInstance {

        prisma: PrismaClient;

    }

};

class AuthRoutes {

    private authController: AuthController;

    constructor(prismaClient: PrismaClient) {

        this.authController = new AuthController(prismaClient);

    }

    public authRoutes = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

        fastify.post('/signup', this.authController.signup);

        fastify.post('/login', {

            config: {

                rateLimit: {

                    max: 5,
                    timeWindow: '1 minute'

                }

            }

        }, this.authController.login);

        fastify.post('/logout', this.authController.logout);

        fastify.put('/update-profilepic', {

            preHandler: protectRouter,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '10 minute'

                }

            }

        }, this.authController.updateProfPic);

        //TODO:
        //fastify.put('/update-profileName', { preHandler: protectRouter }, this.authController.updateProfName);

        //TODO:
        //fastify.put('/update-profileEmail', { preHandler: protectRouter }, this.authController.updateProfEmail);

        //TODO:
        //fastify.put('/update-profilePassword', { preHandler: protectRouter }, this.authController.updateProfPassword);

    };

};

export const authRoutesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;
    const authRoutesInstance: AuthRoutes = new AuthRoutes(prismaInstance);
    await authRoutesInstance.authRoutes(fastify);

};

