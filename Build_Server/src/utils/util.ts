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

export const buildOutput = () => {
    const basePath = path.join(__dirname, '../output_build');   
    console.log(basePath);
    try {
        // const containerId = execSync(`docker create build-container`).toString().trim();

        exec(`docker run temp-build-container build-container`, (error, stdout) => {
            if(error) throw error;
            console.log(stdout);
            
            execSync(`docker cp temp-build-container:/app/dist ${basePath}`)
            console.log("Build artifacts copied successfully.");
            
            execSync(`docker rm temp-build-container`);
            console.log("Temporary container removed successfully.");
    
            execSync(`docker rmi build-container`);
            console.log("Docker image removed successfully.");
        })

    } catch (error:any) {
        console.error("Error during build output process:", error.message);
    }
}