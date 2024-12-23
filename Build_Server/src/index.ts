import { commandOptions } from "redis";
import { subscriber } from "./config/redis";
import dotenv from 'dotenv'
import { deleteLocalFile, downloadS3folder } from "./utils/util";
import { exec, execSync } from "child_process";
import path from 'path'
import fs from 'fs'

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
            await downloadS3folder(`output\\${response.element}\\`)

            console.log("starting Docker");
            const basePath = path.join(__dirname, '/output_build');
            const deleteOutput = path.join(__dirname, `/output`);
            const normalizedBasePath = basePath.replace(/\\/g, '/');
            const quoatedPath = `"${normalizedBasePath}"`

            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
                console.log(`Directory created at: ${basePath}`);
            }

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

                await deleteLocalFile(deleteOutput)
            })
            
        }
    }
}

main()