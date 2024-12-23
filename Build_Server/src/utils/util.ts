import fs from 'fs'
import path from 'path'
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
 * Ensures the specified directory exists. Creates it if it does not.
 * @param {string} dirPath - The path to the directory.
 */
export function createDirectoryIfNotExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[SERVER] Directory created`);
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
        console.log(`[SERVER] Successfully deleted directory`);
    } catch (error) {
        console.error(`[SERVER] Failed to delete directory:`, error);
    }
}
