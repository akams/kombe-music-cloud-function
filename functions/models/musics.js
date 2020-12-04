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

exports.getMusics = getMusics;