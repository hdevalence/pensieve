import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export class AttachmentService {
    private attachmentsPath: string;

    constructor() {
        const storagePath = process.env.STORAGE_PATH;
        if (!storagePath) {
            throw new Error('STORAGE_PATH environment variable not set');
        }
        // Assumes attachments are stored in the attachments.noindex directory
        this.attachmentsPath = path.join(storagePath, 'attachments.noindex');
    }

    /**
     * Reads and decrypts an attachment.
     *
     * @param filePath - The relative file path of the attachment.
     * @param localKey - The base64-encoded composite key (64 bytes) for the attachment.
     *                  Only the first 32 bytes are used for AES decryption.
     * @param iv - The base64-encoded initialization vector (16 bytes).
     * @returns The decrypted file as a Buffer.
     */
    async getAttachment(filePath: string, localKey: string, iv: string): Promise<Buffer> {
        const fullPath = path.join(this.attachmentsPath, filePath);

        console.log('Getting attachment:', filePath, localKey, iv, fullPath);

        // Basic path traversal protection.
        if (!fullPath.startsWith(this.attachmentsPath)) {
            throw new Error('Invalid path');
        }

        // Read the encrypted file data.
        const encryptedData = await fs.readFile(fullPath);

        // Convert the provided decryption parameters from base64.
        const fullKeyBuffer = Buffer.from(localKey, 'base64');
        // Use only the first 32 bytes (AES key) of the 64-byte composite key.
        const keyBuffer = fullKeyBuffer.slice(0, 32);
        const ivBuffer = Buffer.from(iv, 'base64');

        // Create an AES-256-CBC decipher.
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        decipher.setAutoPadding(true);

        // Decrypt the file.
        const decryptedChunks = [decipher.update(encryptedData), decipher.final()];
        const decryptedData = Buffer.concat(decryptedChunks);

        return decryptedData;
    }
}