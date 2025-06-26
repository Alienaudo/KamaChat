import { FastifyInstance, FastifyPluginAsync, RawServerDefault } from "fastify";
import AuthController from "../controllers/Auth.Controller.js";
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

        fastify.put('/update-profile', { preHandler: protectRouter }, this.authController.update);

    };

};

const authRoutesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance = fastify.prisma;
    const authRoutesInstance = new AuthRoutes(prismaInstance);
    await authRoutesInstance.authRoutes(fastify);

};

export default authRoutesPlugin;
