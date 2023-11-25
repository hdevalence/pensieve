import Database from '@signalapp/better-sqlite3';
const fs = require('fs/promises');
const path = require('path');

const storagePath = process.env.STORAGE_PATH || '/you/didnt/set/STORAGE_PATH/env/var';

const dbKey = async () => {
  try {
    const configPath = path.join(storagePath, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    return config['key'];
  } catch (error) {
    console.error("Error reading the config file:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

const connectToDatabase = async () => {
  const dbPath = path.join(storagePath, 'sql/db.sqlite');
  const key = await dbKey();
  console.log(dbPath);
  console.log(key);
  const db = new Database(dbPath, { readonly: true });
  db.pragma(`key = "x'${key}'"`);
  db.pragma('journal_mode = WAL');
  return db
}

export default connectToDatabase;
