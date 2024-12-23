import { execSync } from "child_process";

/**
 * Builds and runs a Docker container, copying build artifacts locally.
 * @param {string} directoryId - The ID of the directory to process.
 * @param {string} outputPath - The path where build artifacts will be saved.
 */
export function buildAndRunDockerContainer(directoryId: any, outputPath: string) {
    try {
        const normalizedPath = outputPath.replace(/\\/g, "/");
        const quotedPath = `"${normalizedPath}"`;

        execSync(`docker build -t build-container --build-arg DIRECTORY_ID=${directoryId} .`);
        console.log("[DOCKER] Docker build completed.");

        execSync(`docker run --name temp-build-container build-container`);
        console.log("[DOCKER] Temporary Docker container created.");

        execSync(`docker cp temp-build-container:/app/dist ${quotedPath}`);
        console.log("[DOCKER] Build artifacts copied to output path.");

        execSync(`docker rm temp-build-container`);
        console.log("[DOCKER] Temporary Docker container removed.");

        execSync(`docker rmi build-container`);
        console.log("[DOCKER] Docker image removed.");
    } catch (error) {
        console.error("[DOCKER] Error during Docker operations:", error);
    }
}