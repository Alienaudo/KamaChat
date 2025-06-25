import jwt from "jsonwebtoken";
import "dotenv/config"
import "@fastify/cookie"
import { FastifyReply } from "fastify";

const jwtsecret: string | undefined = process.env.JWT_SECRET;

if (!jwtsecret) {

    throw new Error('Ambiente variable "JWT_SECRET" is not set');

}

export const generateToken = (userId: string, reply: FastifyReply): string => {

    const token: string = jwt.sign({ userId }, jwtsecret, {

        expiresIn: "7d"

    });

    reply.cookie("jwt", token, {

        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production'

    });

    return token;

};

