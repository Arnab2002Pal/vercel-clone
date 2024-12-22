import { commandOptions } from "redis";
import { subscriber } from "./config/redis";
import dotenv from 'dotenv'
import { buildOutput, downloadS3folder } from "./utils/util";
import { exec, execSync } from "child_process";
import path from 'path'

dotenv.config()

async function main (){
    while (true) {
        const response = await subscriber.brPop(
            commandOptions({isolated: true}),
            'build-queue',
            0
        )
        if(response){
            /*
            Normalize Path Separators: Ensure that the path separators in your prefix match those used in your S3 keys. Replace / with \:

            await downloadS3folder(`output\\${response.element}\\`);
            */
            const basePath = path.join(__dirname, '/output_build');
            const normalizedBasePath = basePath.replace(/\\/g, '/');
            const quoatedPath = `"${normalizedBasePath}"`

            await downloadS3folder(`output\\${response.element}\\`)

            console.log("starting Docker");

            exec(`docker build -t build-container --build-arg DIRECTORY_ID=${response.element} . 2>&1`, async (error, stdout) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log("Copying build artifacts...");

                // Run the container
                execSync(`docker run --name temp-build-container build-container`);
                console.log("Temporary container created successfully.");

                // Copy files from the container
                execSync(`docker cp temp-build-container:/app/dist ${quoatedPath}`);
                console.log("Build artifacts copied successfully.");

                // Remove the temporary container
                execSync(`docker rm temp-build-container`);
                console.log("Temporary container removed successfully.");

                // Optionally remove the image
                execSync(`docker rmi build-container`);
                console.log("Docker image removed successfully.");
            })
            
        }
    }
}

main()