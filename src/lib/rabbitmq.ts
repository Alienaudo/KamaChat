import amqp, { Channel, ChannelModel } from "amqplib";
import { readFile } from "fs/promises";
import "dotenv/config";

const host: string = process.env.HOST_RABBITMQ || 'localhost';
const port: number = Number(process.env.PORT_RABBITMQ || 5671);
const user: string = process.env.USER_RABBITMQ || 'guest';
const password: string = process.env.PASSWORD_RABBITMQ || 'guest';

export const getChannel = async (): Promise<{

    connection: ChannelModel,
    channel: Channel

}> => {

    try {

        const connection: ChannelModel = await amqp.connect({

            protocol: 'amqps',
            hostname: host,
            port: port,
            username: user,
            password: password,
            vhost: '/'

        }, {

            cert: await readFile('./src/rabbitmq-certs/client_certificate.pem'),
            key: await readFile('./src/rabbitmq-certs/client_key.pem'),
            ca: [await readFile('./src/rabbitmq-certs/ca_certificate.pem')],
            servername: 'localhost'

        });

        const channel: Channel = await connection.createChannel();

        return {

            connection,
            channel

        };

    } catch (error: unknown) {

        console.error({

            error: 'Error while connecting to RabbitMQ: ',
            message: error

        });

        throw error;

    };

};

