import { AuthController } from "../controller/Auth.Controller.js";
import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify/types/instance.js";
import { FastifyPluginAsync } from "fastify/types/plugin.js";
import { RawServerDefault } from "fastify";
import { ProtectMiddleware } from "../../../middlewares/ProtectRouter.Middleware.js";

class AuthRoutes {

    private readonly authController: AuthController;
    private readonly protectMiddleware: ProtectMiddleware;

    constructor(prismaClient: PrismaClient, protectMiddleware: ProtectMiddleware) {

        this.authController = new AuthController(prismaClient);
        this.protectMiddleware = protectMiddleware;

    }

    public authRoutes = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

        fastify.post('/signup', this.authController.signup);

        fastify.post('/login', {

            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '1 minute'

                }

            }

        }, this.authController.login);

        fastify.post('/logout', this.authController.logout);

        fastify.put('/update-profilepic', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '10 minute'

                }

            }

        }, this.authController.updateProfPic);

        //TODO:
        fastify.put('/update-profile-name/:newName', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '10 minute'

                }

            }

        }, this.authController.updateProfName);

        //TODO:
        fastify.put('/update-profileEmail', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '10 minute'

                }

            }

        }, this.authController.updateProfEmail);

        //TODO:
        fastify.put('/update-profilePassword', {

            preHandler: this.protectMiddleware.protect,
            config: {

                rateLimit: {

                    max: 3,
                    timeWindow: '10 minute'

                }

            }

        }, this.authController.updateProfPassword);

        //TODO:
        //fastify.delete('/delete', this.authController.delete);

    };

};

export const authRoutesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance<RawServerDefault>): Promise<void> => {

    const prismaInstance: PrismaClient = fastify.prisma;

    const protectMiddlewareInstance: ProtectMiddleware = new ProtectMiddleware(prismaInstance);

    const authRoutesInstance: AuthRoutes = new AuthRoutes(prismaInstance, protectMiddlewareInstance);

    await authRoutesInstance.authRoutes(fastify);

};

