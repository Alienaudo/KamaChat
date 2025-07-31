import { Snowflake } from "@sapphire/snowflake";

export const generateSnowflakeId = async (processId: bigint = 1n, workerId: bigint = 1n, timestamp: number): Promise<bigint> => {

    const EPOCH: number = new Date('2000-01-01T00:00:00.000Z').getTime();

    const snowflake: bigint = new Snowflake(EPOCH)
        .generate({

            processId: processId,
            workerId: workerId,
            timestamp: timestamp

        });

    return snowflake;

};

