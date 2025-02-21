import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

interface Keys {
    aesKey: Buffer;
    macKey: Buffer;
}

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

    private splitKeys(compositeKey: Buffer): Keys {
        // Split the 64-byte key into two 32-byte keys
        return {
            aesKey: compositeKey.slice(0, 32),
            macKey: compositeKey.slice(32, 64)
        };
    }

    /**
     * Reads and decrypts an attachment.
     *
     * @param filePath - The relative file path of the attachment.
     * @param localKey - The base64-encoded composite key (64 bytes) for the attachment.
     *                  Only the first 32 bytes are used for AES decryption.
     * @param iv - The base64-encoded initialization vector (16 bytes).
     * @param size - The expected size of the decrypted file.
     * @returns The decrypted file as a Buffer.
     */
    async getAttachment(
        filePath: string,
        localKey: string,
        iv: string,
        size: number
    ): Promise<Buffer> {
        const fullPath = path.join(this.attachmentsPath, filePath);

        console.log('Getting attachment:', filePath, localKey, iv, fullPath);

        // Basic path traversal protection.
        if (!fullPath.startsWith(this.attachmentsPath)) {
            throw new Error('Invalid path');
        }

        // Read the encrypted file data.
        const encryptedData = await fs.readFile(fullPath);

        // Convert the provided decryption parameters from base64.
        const compositeKeyBuffer = Buffer.from(localKey, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');

        // Split into AES and MAC keys
        const { aesKey, macKey } = this.splitKeys(compositeKeyBuffer);

        // Create HMAC for verification
        const hmac = crypto.createHmac('sha256', macKey);
        hmac.update(encryptedData.slice(0, -32)); // Exclude the MAC at the end

        // Get the stored MAC from the last 32 bytes
        const storedMac = encryptedData.slice(-32);
        const calculatedMac = hmac.digest();

        // Verify MAC
        if (!crypto.timingSafeEqual(calculatedMac, storedMac)) {
            throw new Error('MAC verification failed');
        }

        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, ivBuffer);

        // Decrypt (excluding MAC)
        const decryptedData = Buffer.concat([
            decipher.update(encryptedData.slice(0, -32)),
            decipher.final()
        ]);

        console.log('Decrypted data:', decryptedData);


        // Trim padding to match original size
        return decryptedData.slice(0, size);
    }
}