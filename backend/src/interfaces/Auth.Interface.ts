import { FastifyRequest } from "fastify/types/request";
import { SignupRequestBody } from "./SignupRequestBody.Interface";
import { FastifyReply } from "fastify/types/reply";

interface signup {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

interface login {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<FastifyReply | void>

};

interface logout {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

interface updatePic {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

interface updateName {

    (request: FastifyRequest<{

        Body: SignupRequestBody,
        Params: {

            newName: string

        }

    }>, reply: FastifyReply): Promise<void>

};

export {

    signup,
    login,
    logout,
    updatePic,
    updateName

};
