const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});

const ctrlMusics = require('./controller/musics');
const ctrlAlbums = require('./controller/albums');

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
    const db = admin.firestore();

    const data = await ctrlMusics.handleGetMusics(db, request.query)
    response.json(data);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});

app.get('/get-music', async (request, response) => {
  try {
    const db = admin.firestore();

    const data = await ctrlMusics.handleGetMusicById(db, request.query)
    response.json(data);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});

app.get('/get-albums', async (request, response) => {
  try {
    const db = admin.firestore();
    const data = await ctrlAlbums.handleGetAlbums(db, request.query)
    response.json(data);
  }
  catch(error) {
    response.status(500).send({ err: error.message });
  }
});