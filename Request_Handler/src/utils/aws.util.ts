import {
    GetObjectCommand,
    NoSuchKey,
    S3ServiceException,
} from "@aws-sdk/client-s3";
import { s3Client } from "../configs/aws";
import dotenv from 'dotenv';
dotenv.config()

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
export async function downloadS3file(id: string, path: string) {
    try {
        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET!,
                Key: `output_build\\${id}\\dist${path}`,
            })
        )

        if (response.Body) {
            const bodyString = await response.Body.transformToString() // Await the Promise here
            console.log("[S3] File downloaded Successfully");
            return bodyString
        }
    }
     catch (error) {
        if (error instanceof NoSuchKey) {
            console.error(
                `[S3] Error from S3 while getting object "${id}" from "vercel-clone". No such key exists.`,
            );
        } else if (error instanceof S3ServiceException) {
            console.error(
                `[S3] Error from S3 while getting object from vercel-clone.  ${error.name}: ${error.message}`,
            );
        } else {
            throw error;
        }
    }
}