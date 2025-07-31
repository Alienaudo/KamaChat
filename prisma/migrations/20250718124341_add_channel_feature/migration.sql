-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'audio');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('txt', 'pdf', 'xml', 'odt', 'doc', 'docx', 'xlsx', 'html', 'csv', 'md');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "nick" VARCHAR(25) NOT NULL,
    "name" VARCHAR(35) NOT NULL,
    "hased_password" VARCHAR(255) NOT NULL,
    "profile_pic" TEXT DEFAULT 'default-avatar.avif',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "channel_pic" TEXT DEFAULT 'default-avatar.avif',

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMember" (
    "channel_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("channel_id","user_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID,
    "channel_id" BIGINT,
    "text" TEXT,
    "media" TEXT,
    "media_type" "MediaType",
    "doc" TEXT,
    "doc_type" "DocType",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_nick_key" ON "User"("nick");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_nick_idx" ON "User"("nick");

-- CreateIndex
CREATE INDEX "ChannelMember_channel_id_idx" ON "ChannelMember"("channel_id");

-- CreateIndex
CREATE INDEX "ChannelMember_user_id_idx" ON "ChannelMember"("user_id");

-- CreateIndex
CREATE INDEX "Message_sender_id_created_at_idx" ON "Message"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "Message_receiver_id_created_at_idx" ON "Message"("receiver_id", "created_at");

-- CreateIndex
CREATE INDEX "Message_channel_id_created_at_idx" ON "Message"("channel_id", "created_at");

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
