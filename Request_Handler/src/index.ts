import express from 'express';
import dotenv from 'dotenv'
import { downloadS3file } from './utils/aws.util';

dotenv.config();
const app = express();

/*
 * Global route handler which takes all the request.
 * Example: x.device.com or y.device.com
 * Every request will be handled and id will be extracted from the url.
 */
app.get('/*', async (req, res) => {
    const host = req.hostname;
    const path = req.path;
    const normalizedPath = path.replace(/\//g, "\\"); // Replace all '/' with '\\'

    const id = host.split('.')[0];

    const type =
        normalizedPath.endsWith('html') ? 'text/html' :
            normalizedPath.endsWith('css') ? 'text/css' :
                normalizedPath.endsWith('svg') ? 'image/svg+xml' :
                    normalizedPath.endsWith('js') ? 'application/javascript' :
                        'application/octet-stream'; // Default type for unknown extensions

    try {
        const fileContent = await downloadS3file(id, normalizedPath);
        if (fileContent) {
            res.setHeader('Content-Type', type);
            res.send(fileContent);
        } else {
            res.status(404).send('File not found');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal Server Error');
    }
})

const port = process.env.PORT
const mode = process.env.NODE_ENV?.trim().toUpperCase()
app.listen(port, () => {
    console.log(`Server started in ${mode} mode on port ${port}`);
});