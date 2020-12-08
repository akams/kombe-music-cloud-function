
async function getAlbums(db, limit) {
  try {
    const albums = [];
    let query = db.collection('albums').orderBy('uploadAt', 'desc');
    if (limit) {
      query = query.limit(limit);
    }
    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return albums;
  } catch (error) {
    throw error;
  }
}

async function getAlbumByDocumentId(db, id) {
  try {
    const doc = await db.collection('albums').doc(id).get();
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return {};
  } catch (error) {
    throw error;
  }
}

async function getAlbumByName(db, name) {
  try {
    const snapshot = await db.collection('albums').where('name', '==', name).get();
    let album = {};
    snapshot.forEach((doc) => {
      album = {
        id: doc.id,
        ...doc.data(),
      }
    });
    return album;
  } catch (error) {
    throw error;
  }
}

exports.getAlbums = getAlbums;
exports.getAlbumByDocumentId = getAlbumByDocumentId;
exports.getAlbumByName = getAlbumByName;