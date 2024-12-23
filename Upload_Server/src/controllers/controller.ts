import { Request, Response } from "express";
import { deleteLocalFile, generateID, readAllFiles, uploadFileS3 } from "../utils/util";
import simpleGit from "simple-git";
import path from 'path'
import { publisher } from "../config/redis";

const test = (req: Request, res: Response) => {
    res.status(200).json({
        message: "Working Successfully"
    })
}

const deploy = async (req: Request, res: Response) => {
    const { repoUrl } = req.body;

    try {
        // Extract username and generate unique ID
        const username = repoUrl.split("/")[3];
        const id = generateID(username);
        const basePath = path.join(__dirname, `../output/${id}`);

        console.log(`[Deploy] Cloning repository: ${repoUrl}`);
        await simpleGit().clone(repoUrl, basePath);

        console.log("[Deploy] Reading files...");
        const files = readAllFiles(basePath);

        console.log(`[Deploy] Found ${files.length} files. Uploading to S3...`);

        // Upload files in parallel
        const uploadPromises = files.map(async (localFile) => {
            const baseDir = path.join(__dirname, '../');
            // Tells on "how to get from point A to point B"
            const relativePath = path.relative(baseDir, localFile);
            return uploadFileS3(relativePath, localFile);
        });

        await Promise.all(uploadPromises);
        console.log("[Deploy] All files uploaded successfully.");

        console.log("[Deploy] Adding task to build queue...");
        await publisher.lPush("build-queue", id);

        console.log("[Deploy] Cleaning up local files...");
        await deleteLocalFile(basePath);

        res.status(200).json({ id });
    } catch (error) {
        console.error("[Deploy] Deployment failed:", error);

        // Respond with error message
        res.status(500).json({ error: "Deployment failed. Please try again later." });
    }
};

export default deploy;


export {
    test,
    deploy
}