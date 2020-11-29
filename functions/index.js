const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});

admin.initializeApp(functions.config().firebase);

const db = admin.firestore(); // cloudFireStore Db
const app = express(); // Handle intern API
const main = express(); // Expose API

main.use(cors);
main.use(cookieParser);
main.use('/api/v1', app);
main.use(bodyParser.json());

exports.kombeMusicCF = functions.https.onRequest(main);

app.get('/warmup', (req, res) => {
  res.json({
    msg: 'Warming up serverless.',
  });
})

app.get('/get-musics', async (request, response) => {
  try {
    const bucket = admin.storage().bucket('kombe-music.appspot.com');
    const { id, limit = 10 } = request.query;

    const snapshotAlbums = await db.collection('albums').get();
    const albums = [];
    snapshotAlbums.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    let query = db.collection('music');
    if (id) {
      query = db.collection('music').where('id', '==', id);
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
        } else {
          data.pathName = data.fileName;
        }
      });
    });
  
    const reads = datas.map((data) => bucket.file(`music/${data.pathName}`).getMetadata())
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
    response.json(datas);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});