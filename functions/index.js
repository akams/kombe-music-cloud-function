const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const modelMusics = require('./models/musics');

admin.initializeApp(functions.config().firebase);

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
    const db = admin.firestore();

    const data = await modelMusics.handleGetMusics(db, bucket, request.query)
    response.json(data);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});

app.get('/get-albums', async (request, response) => {
  try {
    const db = admin.firestore();
    const data = await modelMusics.handleGetAlbums(db, request.query)
    response.json(data);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});