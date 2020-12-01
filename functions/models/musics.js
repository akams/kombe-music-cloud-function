
async function handleGetMusics(db, bucket, queryBody) {
  try {
    if (!bucket || !db) {
      throw new Error('{bucket} bucket or {db} db is required to continue the process');
    }
    const { idAlbum, limit = 10 } = queryBody;

    const snapshotAlbums = await db.collection('albums').get();
    const albums = [];
    snapshotAlbums.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    let query = db.collection('music');
    if (idAlbum && idAlbum !== 'all') {
      query = db.collection('music').where('album', '==', idAlbum);
    }

    const snapshot = await query.orderBy('uploadAt', 'desc').limit(limit).get();
    const datas = [];
    snapshot.forEach((doc) => {
      datas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    albums.forEach((album) => {
      datas.forEach((data) => {
        if (data.album === album.id) {
          data.albumName = album.name;
          data.pathName = `${album.name}/${data.fileName}`;
        }
      });
    });

    const reads = datas.map((data) => {
      if (data.pathName) {
        return bucket.file(`music/${data.pathName}`).getMetadata()
      }
      return bucket.file(`music/${data.fileName}`).getMetadata()
    })
    const results = await Promise.all(reads);
    results.forEach((file) => {
      const name = file[0].name;
      const audioUrl = file[0].mediaLink;
      datas.forEach((data) => {
        if (name.indexOf(data.fileName) !== -1) {
          data.audioUrl = audioUrl;
        }
      });
    });
    return datas;
  } catch (error) {
    return error;
  }
}

async function handleGetAlbums(db, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }
    const { limit = 10 } = queryBody;

    const albums = [];
    const snapshot = await db.collection('albums').orderBy('uploadAt', 'desc').limit(limit).get();
    snapshot.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return albums;
  } catch (error) {
    return error;
  }
}

exports.handleGetMusics = handleGetMusics;
exports.handleGetAlbums = handleGetAlbums;