const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const path = require('path');
const modelMusics = require('./models/musics');
const gcs = require('@google-cloud/storage')

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
    const keyPath = path.resolve('./lib/key.json');
    const storage = new gcs.Storage({ keyFilename: keyPath });

    const options = {
      version: 'v2',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60,
    };
    const optionsStorage = {
      storage,
      options,
    };
    const data = await modelMusics.handleGetMusics(db, optionsStorage, request.query)
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