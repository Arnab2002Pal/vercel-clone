import {
    GetObjectCommand,
    ListObjectsV2Command,
    NoSuchKey,
    S3ServiceException,
} from "@aws-sdk/client-s3";
import path from 'path'
import { s3Client } from "../config/aws";
import fs from 'fs'

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


