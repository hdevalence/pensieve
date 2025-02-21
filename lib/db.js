import Database from '@signalapp/better-sqlite3';
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const storagePath = process.env.STORAGE_PATH || '/you/didnt/set/STORAGE_PATH/env/var';

const dbKey = async () => {
  try {
    const configPath = path.join(storagePath, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    // Use the encrypted key if available; fallback to legacy key if needed.
    if (!config['encryptedKey']) {
      if (config['key']) {
        return config['key'];
      }
      throw new Error("No encryptedKey or key found in config file");
    }

    // Get the keychain password from the environment variable.
    const keychainPassword = process.env.KEYCHAIN_PASSWORD;
    if (!keychainPassword) {
      throw new Error("Missing KEYCHAIN_PASSWORD environment variable");
    }

    // Define constants from the Python script.
    const prefix = Buffer.from('v10', 'ascii');
    const salt = Buffer.from('saltysalt', 'ascii');
    const derivedKeyLen = 16; // 128 bits / 8 = 16 bytes
    const numIterations = 1003;
    const iv = Buffer.alloc(16, 32); // 16 space characters (ASCII 32)

    // Convert the hex-encoded encrypted key from config to a Buffer.
    const encryptedKeyBuffer = Buffer.from(config['encryptedKey'], 'hex');

    // Verify that the encrypted key starts with the expected prefix.
    if (!encryptedKeyBuffer.slice(0, prefix.length).equals(prefix)) {
      throw new Error("Encrypted key does not start with expected prefix");
    }

    // Remove the prefix from the encrypted key.
    const payload = encryptedKeyBuffer.slice(prefix.length);

    // Derive the key encryption key (kek) using PBKDF2.
    const kek = crypto.pbkdf2Sync(keychainPassword, salt, numIterations, derivedKeyLen, 'sha1');

    // Decrypt the payload using AES-128-CBC.
    const decipher = crypto.createDecipheriv('aes-128-cbc', kek, iv);
    // Auto-padding is enabled by default, but we set it explicitly.
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(payload);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Convert the decrypted key to an ASCII string.
    const decryptedKey = decrypted.toString('ascii');
    return decryptedKey;
  } catch (error) {
    console.error("Error reading or decrypting the config file:", error);
    throw error;
  }
};

const connectToDatabase = async () => {
  const dbPath = path.join(storagePath, 'sql/db.sqlite');
  const key = await dbKey();
  console.log("Database path:", dbPath);
  const db = new Database(dbPath, { readonly: true });
  // Pass the decrypted key to SQLCipher via the pragma.
  db.pragma(`key = "x'${key}'"`);
  db.pragma('journal_mode = WAL');
  return db;
};

export default connectToDatabase;
