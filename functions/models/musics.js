
async function handleGetMusics(db, optionsStorage, queryBody) {
  try {
    if (!optionsStorage || !db) {
      throw new Error('{optionsStorage} storage or {db} db is required to continue the process');
    }
    const { idAlbum, limit = 9, lastVisible } = queryBody;
    const { storage, options } = optionsStorage;
    const field = 'uploadAt';

    // Recupère les albums
    const snapshotAlbums = await db.collection('albums').get();
    const albums = [];
    snapshotAlbums.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Recupère les musics
    let query = db.collection('music');
    // filtre par id
    if (idAlbum && idAlbum !== 'all') {
      query = db.collection('music').where('album', '==', idAlbum);
    }

    // order by par date
    query = query.orderBy(field, 'desc');

    // start pagination by par date
    if(lastVisible) {
      const parse = JSON.parse(lastVisible);
      const time = new Date(parse[field]._seconds * 1000);
      parse[field] = time;
      query = query.startAfter(parse[field]);
    }

    const snapshot = await query.limit(parseInt(limit)).get();
    let datas = [];
    snapshot.forEach((doc) => {
      datas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // last item
    const last = {
      ...datas[datas.length - 1],
    };

    // rajoute nouvelle key
    datas = datas.map((d) => {
      const o = albums.map((album) => {
        if (d.album === album.id) {
          return {
            albumName: album.name,
            pathName: `${album.name}/${d.fileName}`,
          }
        }
        return undefined;
      });
      return {
        ...d,
        ...o[0],
      }
    });

    // récupère les paths file 
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

    // ajoute lurl signer pour chaque element avec le même nom
    const results = await Promise.all(reads);
    results.forEach((res) => {
      const url = res[0];
      datas.forEach((data) => {
        const c = data.fileName.split(" ");
        const foundSize = c.filter((cc) => url.search(cc) !== -1).length;
        if (foundSize === c.length) {
          data.audioUrl = url;
        }
      });
    });
    return {datas, last};
  } catch (error) {
    throw error;
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