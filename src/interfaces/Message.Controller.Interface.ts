import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { MessageParam } from "./Message.Param.Interface";

export interface getUsersForSidebar {

    (request: FastifyRequest, reply: FastifyReply): Promise<void>;

};

export interface getMessages {

    (request: FastifyRequest<{

        Params: MessageParam

    }>, reply: FastifyReply): Promise<void>;

};

