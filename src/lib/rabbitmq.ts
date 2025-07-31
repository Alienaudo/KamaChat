import amqp, { Channel, ChannelModel } from "amqplib";
import { readFile } from "fs/promises";

const host: string = 'rabbitmq';
const port: number = 5671;

export const getChannel = async (): Promise<{ connection: ChannelModel, channel: Channel }> => {

    try {

        const connection: ChannelModel = await amqp.connect({

            protocol: 'amqps',
            hostname: host,
            port: port,
            username: 'guest',
            password: 'guest',
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

            message: 'Error while connecting to RabbitMQ: ',
            error

        });

        throw error;

    };

};

