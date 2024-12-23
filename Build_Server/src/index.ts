import { commandOptions } from "redis";
import { subscriber } from "./config/redis";
import dotenv from 'dotenv'
import { deleteLocalFile, createDirectoryIfNotExists } from "./utils/util";
import path from 'path'
import { buildAndRunDockerContainer } from "./utils/docker.util";
import { downloadS3folder } from "./utils/aws.util";

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

                createDirectoryIfNotExists(buildOutputPath);

                buildAndRunDockerContainer(id, buildOutputPath);

                console.log("[SERVER] Cleaning up local files...");
                await deleteLocalFile(deleteOutputPath);
            }
        } catch (error) {
            console.error("[SERVER] Error processing build task:", error);
        }
    }
}

processQueue();
