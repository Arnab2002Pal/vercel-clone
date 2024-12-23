import fs from 'fs'

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
