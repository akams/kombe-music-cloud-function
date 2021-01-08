const modelAlbums = require('../models/albums');
const modelMusics = require('../models/musics');

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

async function handleGetAlbumsByAuthor(db, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }
    let { limit = 3, author } = queryBody;

    if (typeof limit === 'string') {
      limit = parseInt(limit);
    }
    console.log({author})
    const musics = await modelMusics.getMusicsAuthor(db, author);
    const uniquAlbumIds = musics.map((music) => music.album).filter((v, i, a) => a.indexOf(v) === i);
    const reads = uniquAlbumIds.map((id) => modelAlbums.getAlbumByDocumentId(db, id));
    const results = await Promise.all(reads);
    return results;
  } catch (error) {
    throw error;
  }
}

exports.handleGetAlbums = handleGetAlbums;
exports.handleGetAlbumsByAuthor = handleGetAlbumsByAuthor;