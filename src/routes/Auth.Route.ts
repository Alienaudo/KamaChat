import { FastifyInstance, FastifyPluginAsync, RawServerDefault } from "fastify";
import { AuthController } from "../controllers/Auth.Controller.js";
import { PrismaClient } from "@prisma/client";
import { protectRouter } from "../middlewares/ProtectRouter.Middleware.js";

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

        fastify.post('/login', this.authController.login);

        fastify.post('/logout', this.authController.logout);

        fastify.put('/update-profilepic', { preHandler: protectRouter }, this.authController.updateProfPic);

        //TODO:
        //fastify.put('/update-profileName', { preHandler: protectRouter }, this.authController.updateProfName);

        //TODO:
        //fastify.put('/update-profileEmail', { preHandler: protectRouter }, this.authController.updateProfEmail);

        //TODO:
        //fastify.put('/update-profilePassword', { preHandler: protectRouter }, this.authController.updateProfPassword);

    };

};

export const authRoutesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance = fastify.prisma;
    const authRoutesInstance = new AuthRoutes(prismaInstance);
    await authRoutesInstance.authRoutes(fastify);

};

