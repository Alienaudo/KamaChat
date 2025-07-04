import { FastifyRequest } from "fastify";
import path, { dirname } from "path";
import pump from "pump";
import { fileURLToPath } from "url";
import fs from 'fs';
import { v7 as uuidv7 } from 'uuid';
import { MultipartFile } from "@fastify/multipart";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const saveTemporaryFile = async (request: FastifyRequest): Promise<string> => {

    const data: MultipartFile | undefined = await request.file();

    if (!data) {

        throw new Error('No file was send');

    }

    try {

        const tempDir: string = path.join(__dirname, '..', '..', 'tmp'); // Ajuste o caminho conforme sua estrutura

        if (!fs.existsSync(tempDir)) {

            fs.mkdirSync(tempDir, {

                recursive: true

            });

        }

        const tempFileName: string = `${uuidv7()}-${data.filename}`;
        const tempFilePath: string = path.join(tempDir, tempFileName);

        pump(data.file, fs.createWriteStream(tempFilePath));

        return tempFilePath;

    } catch (error: unknown) {

        console.error("Falha no stream ao salvar o arquivo:", error);
        throw new Error('Ocorreu um erro interno ao salvar o arquivo.');

    }

};
