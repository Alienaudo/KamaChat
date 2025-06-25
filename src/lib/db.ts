import { Pool } from "pg";
import "dotenv/config";

const HOST: string = process.env.DB_HOST || 'localhost';
const USER: string = process.env.DB_USER || 'admin';
const DB: string = process.env.DB_NAME || 'MyDB';
const PASSWORD: string = process.env.DB_PASSWORD || '123';

const pool = new Pool({

    user: USER,
    host: HOST,
    database: DB,
    password: PASSWORD,
    port: 5432,

});

export const createConnection = async (): Promise<void> => {

    try {

        await pool.connect();


    } catch (error) {

        console.error(error);

    }

};
