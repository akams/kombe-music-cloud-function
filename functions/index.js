const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});

admin.initializeApp(functions.config().firebase);

const db = admin.firestore(); // cloudFireStore Db
const bucket = admin.storage().bucket();
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
    const { id, limit = 10 } = request.query;

    let query = db.collection('music');
    if (id) {
      query = db.collection('music').where('id', '==', id);
    }
    const snapshot = await query.orderBy('createAt', 'desc').limit(limit).get();
    const datas = [];
    snapshot.forEach((doc) => {
      datas.push({
        id: doc.id,
        ...doc.data(),
      });
    });
  
    const reads = datas.map((data) => bucket.file(`music/${data.fileName}`).getMetadata())
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

  // const file = await bucket.file("music/bensound-buddy.mp3").getMetadata();
  // const [metadata] = await file.getMetadata();
  // const url = file[0].mediaLink;
  // response.json({
  //   msg: 'Warming up serverless.',
  //   file,
  //   url,
  // });
});