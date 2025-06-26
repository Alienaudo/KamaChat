import { FastifyReply, FastifyRequest } from "fastify";
import { SignupRequestBody } from "./SignupRequestBody.Interface";

type signup = {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

type login = {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

type logout = {

    (request: FastifyRequest<{ Body: SignupRequestBody }>, reply: FastifyReply): Promise<void>

};

export { signup, login, logout };
