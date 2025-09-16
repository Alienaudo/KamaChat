import { SignupRequestBody } from "../../../interfaces/SignupRequestBody.Interface.js";
import { PrismaClient } from "@prisma/client";
import { login, logout, signup, updateName, updatePic } from "../../../interfaces/Auth.Interface.js";
import { FastifyRequest } from "fastify/types/request.js";
import { FastifyReply } from "fastify/types/reply.js";
import { SignupService } from "../AuthServices/Signup.Service.js";
import { LoginService } from "../AuthServices/Login.Service.js";
import { LogoutService } from "../AuthServices/Logout.Service.js";
import { UpdateProfPicService } from "../AuthServices/UpdateProfPic.Service.js";
import { UpdateProfName } from "../AuthServices/UpdateProfName.Service.js";

export class AuthController {

    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    };

    public signup: signup = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const servie: SignupService = new SignupService(this.prisma);
        await servie.signup(request, reply);

    };

    public login: login = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const servie: LoginService = new LoginService(this.prisma);
        await servie.login(request, reply);

    };

    public logout: logout = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        const servie: LogoutService = new LogoutService();
        await servie.logout(reply);

    };

    public updateProfPic: updatePic = async (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void> => {

        const servie: UpdateProfPicService = new UpdateProfPicService();
        await servie.update(request, reply);

    };

    public updateProfName: updateName = async (request: FastifyRequest<{

        Body: SignupRequestBody,
        Params: {

            newName: string

        }

    }>, reply: FastifyReply): Promise<void> => {

        const servie: UpdateProfName = new UpdateProfName(this.prisma);
        await servie.update(request, reply);

    };

    //TODO:
    public updateProfEmail = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

    //TODO:
    public updateProfPassword = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

};

