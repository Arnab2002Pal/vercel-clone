import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';
import { s3Client } from '../config/aws';

const MAX_LENGTH= process.env.NODE_ENV?.trim().toLowerCase() === 'prod' ? 10 : 5

/**
 * Generates a unique identifier by combining a random string and a username.
 * The length of the random string is determined by the `MAX_LENGTH` constant.
 *
 * @param {string} username - The username to be combined with the random string.
 *
 * @returns {string} - The generated unique identifier in the format: `${randomString}_${username}`.
 *                     The random string is generated using a subset of alphanumeric characters.
 */
export function generateID(username: string): string {
    let id = "";
    const subset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < MAX_LENGTH; i++) {
        id += subset.charAt(Math.floor(Math.random() * subset.length));
    }
    return `${id}_${username}`;
}


/**
 * Reads all files within a specified directory and its subdirectories recursively.
 *
 * @param {string} folderPath - The path to the directory to read files from.
 *                              This should include the full path to the directory on the local file system.
 *                              For example, '/Users/username/Documents/myFolder'.
 *
 * @returns {string[]} - An array of strings representing the full file paths of all files found within the specified directory and its subdirectories.
 *                      Each string in the array includes the full path to the file, including the folder structure.
 *                      For example, ['/Users/username/Documents/myFolder/file1.txt', '/Users/username/Documents/myFolder/subFolder/file2.jpg'].
 */
export function readAllFiles(folderPath: string): string[] {
    let response: string[] = [];
    const readAllFile = fs.readdirSync(folderPath);

    readAllFile.forEach((file) => {
        const fullFilePath = path.join(folderPath, file);

        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(readAllFiles(fullFilePath));
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}


/**
 * Uploads a file to Amazon S3.
 *
 * @param {string} fileName - The desired file path and name in the S3 bucket where the file will be stored. 
 *                            This should include the folder structure (if any) and the file name with its extension.
 *                            For example, 'uploads/images/photo.jpg' will store the file in the 'uploads/images' folder 
 *                            with the name 'photo.jpg' in the S3 bucket.
 * @param {string} localFilePath - The full path to the file on the local file system to upload.
 *                                 For example, '/Users/username/Documents/photo.jpg'.
 * @returns {Promise<void>} - A Promise that resolves when the upload is complete.
 */
export const uploadFileS3 = async (fileName: string, localFilePath: string) => {
    try {
        const fileContent = fs.readFileSync(localFilePath); 

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: 'vercel-clone-bucket-2002',
                Key: fileName,
                Body: fileContent,
            },
        });

        upload.on('httpUploadProgress', (progress) => {
            const isSmallFile = progress.total && progress.total < 1024 * 1024; // Check if the file size is less than 1 MB
            if (isSmallFile) {
                console.log(
                    `Uploading: ${progress.loaded} bytes of ${progress.total ? progress.total : 'Unknown'
                    } bytes.`
                );
            } else {
                const loadedMB = (progress.loaded! / (1024 * 1024)).toFixed(2);
                const totalMB = progress.total
                    ? (progress.total / (1024 * 1024)).toFixed(2)
                    : 'Unknown';
              
                console.log(
                    `Uploading: ${loadedMB} MB of ${totalMB} MB`
                );
            }
        });

        await upload.done();        
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

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
