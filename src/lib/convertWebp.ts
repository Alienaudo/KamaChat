import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { v7 as uuidv7 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path/posix';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const convertImageToWebP = async (

    ImageData: Buffer | string,
    quality: number = 80,
    lossless: boolean = false

): Promise<string> => {

    return new Promise<string>((resolve, reject): void => {

        const tempDir: string = path.join(__dirname, '..', '..', 'tmp');

        if (!fs.existsSync(tempDir)) {

            fs.mkdirSync(tempDir);
            console.log('temp was created\n');

        }

        const uniqueId: string = uuidv7();
        const tempInputPath: string = path.join(tempDir, `${uniqueId}-original.tmp`);
        const tempOutputPath: string = path.join(tempDir, `${uniqueId}.webp`);

        let actualInputPath: string = tempInputPath;

        if (Buffer.isBuffer(ImageData)) {

            try {

                fs.writeFileSync(tempInputPath, ImageData);
                console.log(`Original temp image was saved in: ${tempInputPath}`);

            } catch (error) {

                return reject(new Error(`Error while saving temp image: ${error}`));

            }

        }

        if (typeof ImageData === 'string') {

            if (!fs.existsSync(ImageData)) {

                return reject(new Error(`Input archive not found  ${ImageData}`));

            }

            actualInputPath = ImageData;

        }

        const args: string[] = [

            '-i', actualInputPath, // Input archive (can be temp or original)
            '-q:v', quality.toString(),
            '-c:v', 'libwebp',
            '-compression_level', '6',
            '-preset', 'photo',
            tempOutputPath

        ];

        if (lossless) {

            args.push('-lossless', '1');

        }

        console.log(`Running the FFmpeg command: ffmpeg ${args.join(' ')}`);

        const ffmpegProcess: ChildProcessWithoutNullStreams = spawn('ffmpeg', args);

        ffmpegProcess.stderr.on('data', (data): void => {

            console.error(`FFmpeg stderr: ${data}`);

        });

        ffmpegProcess.on('close', async (code: number): Promise<void> => {

            if (code !== 0) {

                if (fs.existsSync(tempOutputPath)) {

                    fs.unlinkSync(tempOutputPath);
                    console.warn(`Temporary output file removed due to error: ${tempOutputPath}`);

                }

                return reject(new Error(`FFmpeg exited with code ${code}. Error converting to WebP.`));

            }

            if (Buffer.isBuffer(ImageData) && fs.existsSync(tempInputPath)) {

                fs.unlinkSync(tempInputPath);
                console.log(`Temporary input file removed: ${tempInputPath}`);

            }

            console.log(`WebP conversion completed successfully: ${tempOutputPath}`);
            return resolve(tempOutputPath);

        });

        ffmpegProcess.on('error', (err: Error): void => {

            if (Buffer.isBuffer(ImageData) && fs.existsSync(tempInputPath)) {

                fs.unlinkSync(tempInputPath);
                console.log(`Temporary input file removed due to error: ${tempInputPath}`);

            }

            console.error(`Failed to start FFmpeg process: ${err.message}`);
            return reject(err);

        });

    });

};

