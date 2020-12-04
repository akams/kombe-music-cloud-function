
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

exports.getAlbums = getAlbums;