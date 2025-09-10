import { DoneFuncWithErrOrRes } from "fastify";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";

export interface ProtectRouter {

    (request: FastifyRequest<{ Body: any, Params: any }>,
        reply: FastifyReply,
        next: DoneFuncWithErrOrRes): Promise<FastifyReply | void>

};

