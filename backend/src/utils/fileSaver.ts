import { FastifyRequest } from "fastify";
import { dirname, join } from "path";
import pump from "pump";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { MultipartFile } from "@fastify/multipart";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const saveTemporaryFile = async (request: FastifyRequest): Promise<string> => {

    const data: MultipartFile | undefined = await request.file();

    if (!data) {

        throw new Error('No file was send');

    }

    try {

        const tempDir: string = join(__dirname, '..', '..', 'tmp');

        if (!existsSync(tempDir)) {

            mkdirSync(tempDir, {

                recursive: true

            });

        }

        const tempFileName: string = `${Date.now()}-${data.filename}`;
        const tempFilePath: string = join(tempDir, tempFileName);

        pump(data.file, createWriteStream(tempFilePath));

        return tempFilePath;

    } catch (error: unknown) {

        console.error("Error in stream while saving file: ", error);
        throw new Error("Error during save file");

    }

};
