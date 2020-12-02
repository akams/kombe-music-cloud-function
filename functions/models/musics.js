
async function handleGetMusics(db, optionsStorage, queryBody) {
  try {
    if (!optionsStorage || !db) {
      throw new Error('{optionsStorage} storage or {db} db is required to continue the process');
    }
    const { idAlbum, limit = 10 } = queryBody;
    const { storage, options } = optionsStorage;

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

    const snapshot = await query.orderBy('uploadAt', 'desc').limit(parseInt(limit)).get();
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
        return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.pathName}`)
          .getSignedUrl(options);
      }
      return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.fileName}`)
          .getSignedUrl(options);
    })
    const results = await Promise.all(reads);
    results.forEach((res) => {
      const url = res[0];
      datas.forEach((data) => {
        const c = data.fileName.split(" ");
        const foundSize = c.filter((cc) => url.search(cc) !== -1).length;
        console.log
        if (foundSize === c.length) {
          data.audioUrl = url;
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
    const { limit = 4 } = queryBody;

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