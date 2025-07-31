import { PrismaClient } from "@prisma/client";
import { FastifyRequest } from "fastify/types/request";
import { FastifyReply } from "fastify/types/reply";
import { UserProtectRouter } from "../../../interfaces/UserProtectRoute.Interface.js";
import { CreateChannelService } from "../ChannelServices/CreateChannel.Service.js";
import { AddMembersService } from "../ChannelServices/AddMembers.Service.js";
import { GetChannelsService } from "../ChannelServices/GetChannels.Service.js";
import { UpdateChannelPicService } from "../ChannelServices/UpdateChannelPic.Service.js";
import { ChannelParam } from "../../../interfaces/Channel.Param.js";
import { UpdateChannelNameService } from "../ChannelServices/UpdateChannelName.Service.js";
import { addMembersToChannel, createChannel, getChannelsForSidebar, updateChannelPic } from "../../../interfaces/Channel.Controller.Interface.js";

export class ChannelController {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {

        this.prisma = prisma;

    }

    public createChannel: createChannel = async (request: FastifyRequest<{ Params: ChannelParam }>, reply: FastifyReply): Promise<void> => {

        const service: CreateChannelService = new CreateChannelService(this.prisma);

        await service.create(request, reply);

    };

    public addMembersToChannel: addMembersToChannel = async (request: FastifyRequest<{

        Body: UserProtectRouter,
        Params: ChannelParam

    }>, reply: FastifyReply): Promise<void> => {

        const service: AddMembersService = new AddMembersService(this.prisma);

        await service.add(request, reply);

    };

    public getChannelsForSidebar: getChannelsForSidebar = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {

        const service: GetChannelsService = new GetChannelsService(this.prisma);

        await service.get(request, reply);

    };

    public updateChannelPic: updateChannelPic = async (request: FastifyRequest<{

        Params: {

            id: bigint

        }

    }>, reply: FastifyReply): Promise<void> => {

        const service: UpdateChannelPicService = new UpdateChannelPicService(this.prisma);

        await service.updatePic(request, reply);

    };

    public updateChannelName = async (request: FastifyRequest<{

        Body: {

            id: bigint
            name: string
            newName: string

        }

    }>, reply: FastifyReply): Promise<void> => {

        const service: UpdateChannelNameService = new UpdateChannelNameService(this.prisma);

        await service.update(request, reply);

    };

    public updateChannelDescription = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

    public makeMemberAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

    public makeAdminMember = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

    public removeMember = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

    public deleteChannel = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => { };

};

