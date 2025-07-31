import { FastifyReply } from "fastify/types/reply"
import { FastifyRequest } from "fastify/types/request"
import { UserProtectRouter } from "./UserProtectRoute.Interface"
import { ChannelParam } from "./Channel.Param"

export interface createChannel {

    (request: FastifyRequest<{ Params: ChannelParam }>, reply: FastifyReply): Promise<void>

};

export interface addMembersToChannel {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: ChannelParam

    }>, reply: FastifyReply): Promise<void>

};

export interface getChannelsForSidebar {

    (request: FastifyRequest, reply: FastifyReply): Promise<void>

};

export interface updateChannelPic {

    (request: FastifyRequest<{

        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<void>

};
