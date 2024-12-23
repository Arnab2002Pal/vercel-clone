import {
    GetObjectCommand,
    ListObjectsV2Command,
    NoSuchKey,
    S3ServiceException,
} from "@aws-sdk/client-s3";
import path from 'path'
import fs from 'fs'
import { s3Client } from "../config/aws";
import { exec, execSync } from "child_process";
import { error } from "console";
import { stdout } from "process";

//prefix: Download from S3 defined path
export async function downloadS3folder(prefix: string) {
    console.log("Inside Function");
    try {
        // List all objects with the given prefix
        const listResponse = await s3Client.send(
            new ListObjectsV2Command({
                Bucket: process.env.AWS_BUCKET!,
                Prefix: prefix,
            })
        )

        if(!listResponse.Contents || listResponse.Contents.length === 0) {
            console.error("No files found in the specified S3 prefix.");
            return;
        }
        for(const obj of listResponse.Contents) {
            if(!obj.Key){
                console.error("No key found in the.");
                break;
            }
            
            const response  = await s3Client.send(
                new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET!,
                    Key: obj.Key,
                })
            )
            
            if(response.Body) {
                const content = await response.Body.transformToString();
                const filePath = path.join(__dirname, `../${obj.Key}`);
                const dirName = path.dirname(filePath);

                if (!fs.existsSync(dirName)) {
                    fs.mkdirSync(dirName, { recursive: true }); // Create directories recursively
                }

                fs.writeFileSync(filePath, content, { encoding: 'utf8' }); // Write content to the file
            }
        }

        console.log("File downloaded Successfully");
        
          
    } catch (error) {
        if (error instanceof NoSuchKey) {
            console.error(
                `Error from S3 while getting object "${prefix}" from "vercel-clone". No such key exists.`,
            );
        } else if (error instanceof S3ServiceException) {
            console.error(
                `Error from S3 while getting object from vercel-clone.  ${error.name}: ${error.message}`,
            );
        } else {
            throw error;
        }
    }
    
}

/**
 * Deletes a local directory and all its contents recursively.
 *
 * @param {string} directory - The path to the local directory to be deleted.
 *                            This should include the full path to the directory on the local file system.
 *                            For example, '/Users/username/Documents/myFolder'.
 *
 * @returns {void} - The function does not return any value.
 *                   However, it logs a success message to the console if the directory is successfully deleted,
 *                   or logs an error message to the console if an error occurs during the deletion process.
 */
export const deleteLocalFile = (directory: string) => {
    try {
        fs.rmSync(directory, { recursive: true, force: true });
        console.log(`Successfully deleted directory`);
    } catch (error) {
        console.error(`Failed to delete directory:`, error);
    }
}
