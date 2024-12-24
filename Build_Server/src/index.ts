import { commandOptions } from "redis";
import { statusSubscriber, subscriber } from "./config/redis";
import dotenv from 'dotenv'
import { deleteLocalFile, createDirectoryIfNotExists, readAllFiles } from "./utils/util";
import path from 'path'
import { buildAndRunDockerContainer } from "./utils/docker.util";
import { downloadS3folder, uploadFileS3 } from "./utils/aws.util";

dotenv.config()

/**
 * Main function to continuously process build tasks from the Redis queue.
 */
async function processQueue() {
    while (true) {
        try {
            const response = await subscriber.brPop(
                commandOptions({ isolated: true }),
                "build-queue",
                0
            );

            if (response) {
                const id = response.element;
                const outputPath = `output\\${id}\\`;

                console.log(`[SERVER] Downloading files from S3 for: ${id}`);
                await downloadS3folder(outputPath);

                console.log("[SERVER] Starting Docker build process...");
                const buildOutputPath = path.join(__dirname, `/output_build/${id}`);
                const deleteOutputPath = path.join(__dirname, "/output");
                const deleteBuildOutputPath = path.join(__dirname, "/output_build");

                createDirectoryIfNotExists(buildOutputPath);

                buildAndRunDockerContainer(id, buildOutputPath);

                console.log("[SERVER] Cleaning up local files...");
                await deleteLocalFile(deleteOutputPath);

                
                console.log("[SERVER] Reading local files...");
                const files = await readAllFiles(buildOutputPath)
                
                console.log(`Found ${files.length} files. Uploading to S3...`);
                
                console.log("[SERVER] Uploading local files to Bucket");
                const promiseUpload = files.map(async localfile =>{
                    const baseDir = path.join(__dirname, '../dist')
                    // Tells on "how to get from point A to point B"
                    const relativePath = path.relative(baseDir, localfile)
                    return uploadFileS3(relativePath, localfile)
                })
                
                await Promise.all(promiseUpload);
                console.log("[Deploy] All files uploaded successfully.");
                                
                console.log("[Deploy] Removing Build directory");
                await deleteLocalFile(deleteBuildOutputPath);
                console.log("[Deploy] Build directory removed successfully");

                await statusSubscriber.hSet("status", id, "Deployed")
                console.log(`[Deploy] Status: Deployed for ID: ${id}`);

            }
        } catch (error) {
            console.error("[SERVER] Error processing build task:", error);
        }
    }
}

processQueue();
