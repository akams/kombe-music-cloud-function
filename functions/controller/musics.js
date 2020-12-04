const gcs = require('@google-cloud/storage');
const path = require('path');
const modelMusics = require('../models/musics');

async function handleGetMusics(db, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }

    const keyPath = path.resolve('./lib/key.json');
    const storage = new gcs.Storage({ keyFilename: keyPath });

    const options = {
      version: 'v2',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60,
    };

    const data = modelMusics.getMusics(db, storage, options, queryBody);
    return data;
  } catch (error) {
    throw error;
  }
}

exports.handleGetMusics = handleGetMusics;