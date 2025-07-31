FROM node:24-alpine

WORKDIR /home/app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable pnpm

RUN pnpm install

COPY . .

EXPOSE 3000

RUN pnpm prisma generate

RUN pnpm tsc

CMD [ "pnpm", "start" ]
