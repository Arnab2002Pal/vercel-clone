import {
    GetObjectCommand,
    ListObjectsV2Command,
    NoSuchKey,
    S3ServiceException,
} from "@aws-sdk/client-s3";
import path from 'path'
import { s3Client } from "../config/aws";
import fs from 'fs'
import { Upload } from "@aws-sdk/lib-storage";

/**
 * This function downloads all files from a specified S3 prefix to the local filesystem.
 *
 * @param prefix - The S3 prefix (folder path) from which to download files.
 *
 * @returns {Promise<void>} - A promise that resolves when all files have been downloaded successfully,
 * or rejects with an error if any occur during the download process.
 *
 * @throws {NoSuchKey} - If the specified S3 prefix does not exist.
 * @throws {S3ServiceException} - If an error occurs while interacting with the S3 service.
 */
export async function downloadS3folder(prefix: string) {
    try {
        // List all objects with the given prefix
        const listResponse = await s3Client.send(
            new ListObjectsV2Command({
                Bucket: process.env.AWS_BUCKET!,
                Prefix: prefix,
            })
        )

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            console.error("[S3 Bucket] No files found in the specified S3 prefix.");
            return;
        }

        console.log(`[S3 Bucket] Total Downloadable Files: ${listResponse.Contents.length}`)

        for (const obj of listResponse.Contents) {
            if (!obj.Key) {
                console.error("[S3 Bucket] No key found in the.");
                break;
            }

            const response = await s3Client.send(
                new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET!,
                    Key: obj.Key,
                })
            )

            if (response.Body) {
                const content = await response.Body.transformToString();
                const filePath = path.join(__dirname, `../${obj.Key}`);
                const dirName = path.dirname(filePath);

                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true }); // Create directories recursively
                }

                fs.writeFileSync(filePath, content, { encoding: 'utf8' }); // Write content to the file
            }
        }

        console.log("[S3 Bucket] File downloaded Successfully");


    } catch (error) {
        if (error instanceof NoSuchKey) {
            console.error(
                `[S3 Bucket] Error from S3 while getting object "${prefix}" from "vercel-clone". No such key exists.`,
            );
        } else if (error instanceof S3ServiceException) {
            console.error(
                `[S3 Bucket] Error from S3 while getting object from vercel-clone.  ${error.name}: ${error.message}`,
            );
        } else {
            throw error;
        }
    }
}

/**
 * Uploads a file to Amazon S3.
 *
 * @param {string} fileName - The desired file path and name in the S3 bucket where the file will be stored. 
 *                            This should include the folder structure (if any) and the file name with its extension.
 *                            For example, 'uploads/images/photo.jpg' will store the file in the 'uploads/images' folder 
 *                            with the name 'photo.jpg' in the S3 bucket.
 * @param {string} localFilePath - The full path to the file on the local file system to upload.
 *                                 For example, '/Users/username/Documents/photo.jpg'.
 * @returns {Promise<void>} - A Promise that resolves when the upload is complete.
 */
export const uploadFileS3 = async (fileName: string, localFilePath: string) => {
    try {
        const fileContent = fs.readFileSync(localFilePath);

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: 'vercel-clone-bucket-2002',
                Key: fileName,
                Body: fileContent,
            },
        });

        upload.on('httpUploadProgress', (progress) => {
            const isSmallFile = progress.total && progress.total < 1024 * 1024; // Check if the file size is less than 1 MB
            if (isSmallFile) {
                console.log(
                    `[S3] Uploading: ${progress.loaded} bytes of ${progress.total ? progress.total : 'Unknown'
                    } bytes.`
                );
            } else {
                const loadedMB = (progress.loaded! / (1024 * 1024)).toFixed(2);
                const totalMB = progress.total
                    ? (progress.total / (1024 * 1024)).toFixed(2)
                    : 'Unknown';

                console.log(
                    `[S3] Uploading: ${loadedMB} MB of ${totalMB} MB`
                );
            }
        });

        await upload.done();
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};