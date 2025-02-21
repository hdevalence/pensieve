import { NextApiRequest, NextApiResponse } from 'next';
import { AttachmentService } from '@/services/attachments';

export const config = {
    api: {
        responseLimit: false,
    },
};

const attachmentService = new AttachmentService();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { path: pathParts, localKey, iv } = req.query;
        const contentType = req.query.contentType as string;

        if (!contentType) {
            return res.status(400).json({ error: 'contentType is required' });
        }
        if (!localKey || typeof localKey !== 'string') {
            return res.status(400).json({ error: 'localKey is required' });
        }
        if (!iv || typeof iv !== 'string') {
            return res.status(400).json({ error: 'iv is required' });
        }
        if (!pathParts || !Array.isArray(pathParts)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        // Reconstruct the file path from the URL segments
        const filePath = pathParts.join('/');
        console.log(`Serving attachment: ${filePath}`);

        // Get the decrypted attachment data using the provided decryption parameters.
        const data = await attachmentService.getAttachment(filePath, localKey, iv);

        // Set the correct content type and send the data.
        res.setHeader('Content-Type', contentType);
        res.send(data);
    } catch (error) {
        console.error('Error serving attachment:', error);
        res.status(500).json({ error: 'Failed to serve attachment' });
    }
}