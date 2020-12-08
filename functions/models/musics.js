const modelAlbums = require('./albums');

async function getMusicsByAlbums(db, queryBody) {
  try {
    const { idAlbum, limit = 9, lastVisible } = queryBody;
    const field = 'uploadAt';
    // Recupère les albums
    const albums  = await modelAlbums.getAlbums(db);
  
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
    let last = {};
    if (datas.length !== 0) {
      last = {
        [field]: datas[datas.length - 1][field],
      };
    }

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
      }).filter((v) => typeof v !== "undefined");
      return {
        ...d,
        ...o[0],
      }
    });

    return {datas, last};
  } catch (error) {
    throw error;
  }
}

async function getMusicTagIdDocument(db, queryBody) {
  try {
    const { id } = queryBody;
  
    // Recupère les musics
    const query = db.collection('music').doc(id)
    const doc = await query.get();
    let datas = [];
    if (doc.exists) {
      datas.push({
        id: doc.id,
        ...doc.data()
      })
    } else {
      console.log("No such document!");
    }
    const albumId = datas[0].album;
    // Recupère les albums
    const album  = await modelAlbums.getAlbumByDocumentId(db, albumId);

    // rajoute nouvelle key
    datas = datas.map((data) => {
      if (data.album === album.id) {
        return {
          albumName: album.name,
          pathName: `${album.name}/${data.fileName}`,
          ...data,
        };
      }
      return {
        ...data,
      };
    });

    return datas;
  } catch (error) {
    throw error;
  }
}

async function getMusicTagAuthor(db, queryBody) {
  try {
    const { author, limit = 9, lastVisible } = queryBody;
    const field = 'uploadAt';
    // Recupère les albums
    const albums  = await modelAlbums.getAlbums(db);
  
    // Recupère les musics
    let query = db.collection('music');
    // filtre par id
    query = db.collection('music').where('author', '==', author);
  
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
    let last = {};
    if (datas.length !== 0) {
      last = {
        [field]: datas[datas.length - 1][field],
      };
    }

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
      }).filter((v) => typeof v !== "undefined");
      return {
        ...d,
        ...o[0],
      }
    });

    return {datas, last};
  } catch (error) {
    throw error;
  }
}

async function getMusicTagAlbumName(db, queryBody) {
  try {
    const { albumName, limit = 9, lastVisible } = queryBody;
    const field = 'uploadAt';
    // Recupère les albums
    const album  = await modelAlbums.getAlbumByName(db, albumName);
    console.log({ album });
    // Recupère les musics
    let query = db.collection('music');
    // filtre par id album
    query = db.collection('music').where('album', '==', album.id);
  
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
    let last = {};
    if (datas.length !== 0) {
      last = {
        [field]: datas[datas.length - 1][field],
      };
    }

    // rajoute nouvelle key
    datas = datas.map((d) => {
      const o = [album].map((alb) => {
        if (d.album === alb.id) {
          return {
            albumName: alb.name,
            pathName: `${alb.name}/${d.fileName}`,
          }
        }
        return undefined;
      }).filter((v) => typeof v !== "undefined");
      return {
        ...d,
        ...o[0],
      }
    });

    return {datas, last};
  } catch (error) {
    throw error;
  }
}


async function getMusics(db, storage, optionsStorage, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }

    // Recupère les musics
    let { datas, last}  = await getMusicsByAlbums(db, queryBody);

    // récupère les paths file 
    const reads = datas.map((data) => {
      if (data.pathName) {
        return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.pathName}`)
          .getSignedUrl(optionsStorage);
      }
      return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.fileName}`)
          .getSignedUrl(optionsStorage);
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

async function getMusicById(db, storage, optionsStorage, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }

    // Recupère la music
    let datas = await getMusicTagIdDocument(db, queryBody);

    // récupère les paths file 
    const reads = datas.map((data) => {
      if (data.pathName) {
        return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.pathName}`)
          .getSignedUrl(optionsStorage);
      }
      return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.fileName}`)
          .getSignedUrl(optionsStorage);
    })

    // // ajoute lurl signer pour chaque element avec le même nom
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
    return { datas };
  } catch (error) {
    throw error;
  }
}

async function getMusicByAuthor(db, storage, optionsStorage, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }

    // Recupère la music
    let { datas, last } = await getMusicTagAuthor(db, queryBody);

    // récupère les paths file 
    const reads = datas.map((data) => {
      if (data.pathName) {
        return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.pathName}`)
          .getSignedUrl(optionsStorage);
      }
      return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.fileName}`)
          .getSignedUrl(optionsStorage);
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
    return { datas, last };
  } catch (error) {
    throw error;
  }
}

async function getMusicByAlbumName(db, storage, optionsStorage, queryBody) {
  try {
    if (!db) {
      throw new Error('{db} db is required to continue the process');
    }

    // Recupère la music
    let { datas, last } = await getMusicTagAlbumName(db, queryBody);

    // récupère les paths file 
    const reads = datas.map((data) => {
      if (data.pathName) {
        return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.pathName}`)
          .getSignedUrl(optionsStorage);
      }
      return storage
          .bucket('kombe-music.appspot.com')
          .file(`music/${data.fileName}`)
          .getSignedUrl(optionsStorage);
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
    return { datas, last };
  } catch (error) {
    throw error;
  }
}

exports.getMusics = getMusics;
exports.getMusicById = getMusicById;
exports.getMusicByAuthor = getMusicByAuthor;
exports.getMusicByAlbumName = getMusicByAlbumName;