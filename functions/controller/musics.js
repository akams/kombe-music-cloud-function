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

async function handleGetMusicByQuery(db, queryBody) {
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

    const { id, author, albumName } = queryBody;
    let data = {};

    if (id) {
      data = modelMusics.getMusicById(db, storage, options, queryBody);
    } else if (author) {
      data = modelMusics.getMusicByAuthor(db, storage, options, queryBody);
    }  else if (albumName) {
      data = modelMusics.getMusicByAlbumName(db, storage, options, queryBody);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

exports.handleGetMusics = handleGetMusics;
exports.handleGetMusicByQuery = handleGetMusicByQuery;