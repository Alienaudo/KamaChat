import { FastifyReply } from "fastify/types/reply"
import { FastifyRequest } from "fastify/types/request"
import { UserProtectRouter } from "./UserProtectRoute.Interface"
import { ChannelParam } from "./Channel.Param"

export interface createChannel {

    (request: FastifyRequest<{ Params: ChannelParam }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface addMembersToChannel {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: ChannelParam

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface getChannelsForSidebar {

    (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface updateChannelPic {

    (request: FastifyRequest<{

        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface updateChannelName {

    (request: FastifyRequest<{

        Body: {

            id: bigint
            name: string
            newName: string

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface updateChannelDescription {

    (request: FastifyRequest<{

        Body: {

            id: bigint
            name: string
            newDesciption: string

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface makeMemberAdmin {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface makeAdminMember {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface removeMember {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};

export interface deleteChannel {

    (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<FastifyReply | void>

};
