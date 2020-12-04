const modelAlbums = require('../models/albums');

async function handleGetAlbums(db, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }
    let { limit = 3 } = queryBody;

    if (typeof limit === 'string') {
      limit = parseInt(limit);
    }

    const albums = await modelAlbums.getAlbums(db, limit);
    return albums;
  } catch (error) {
    throw error;
  }
}

exports.handleGetAlbums = handleGetAlbums;