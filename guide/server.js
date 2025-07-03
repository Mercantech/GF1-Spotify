const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const songsFile = path.join(__dirname, 'backend/data/songs.json');

class Song {
  constructor({ id, title, artist, mp3, cover }) {
    this.id = id || Date.now().toString();
    this.title = title;
    this.artist = artist;
    this.mp3 = mp3;
    this.cover = cover;
  }
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spotify-klon API',
      version: '1.0.0',
      description: 'API dokumentation for din Spotify-klon',
    },
  },
  apis: ['./server.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Forside på API'et
 *     description: Returnerer en velkomstbesked.
 *     responses:
 *       200:
 *         description: Succes!
 */
app.get('/', (req, res) => {
  res.send('Velkommen til din Spotify-klon!');
});

/**
 * @swagger
 * /songs:
 *   get:
 *     summary: Hent alle sange
 *     responses:
 *       200:
 *         description: En liste af sange
 */
app.get('/songs', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    const songs = JSON.parse(data);
    res.json(songs);
  });
});

/**
 * @swagger
 * /songs:
 *   post:
 *     summary: Tilføj en ny sang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Sangens titel
 *               artist:
 *                 type: string
 *                 description: Kunstnerens navn
 *               mp3:
 *                 type: string
 *                 description: Filnavn på MP3-filen
 *               cover:
 *                 type: string
 *                 description: Filnavn på cover-billedet
 *             required:
 *               - title
 *               - artist
 *     responses:
 *       201:
 *         description: Sangen blev tilføjet
 *       400:
 *         description: Manglende påkrævede felter
 */
app.post('/songs', (req, res) => {
  const { title, artist, mp3, cover } = req.body;
  
  // Validering af påkrævede felter
  if (!title || !artist) {
    return res.status(400).json({ 
      error: 'Manglende påkrævede felter', 
      required: ['title', 'artist'] 
    });
  }
  
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    const songs = JSON.parse(data);
    const newSong = new Song({ title, artist, mp3, cover });
    songs.push(newSong);
    fs.writeFile(songsFile, JSON.stringify(songs, null, 2), err => {
      if (err) return res.status(500).send('Fejl ved gemning af sang');
      res.status(201).json(newSong);
    });
  });
});

/**
 * @swagger
 * /songs/{id}:
 *   put:
 *     summary: Opdater en sang
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sangen blev opdateret
 */
app.put('/songs/:id', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    let songs = JSON.parse(data);
    const songId = req.params.id;
    const songIndex = songs.findIndex(s => s.id == songId);
    if (songIndex === -1) return res.status(404).send('Sang ikke fundet');
    songs[songIndex] = { ...songs[songIndex], ...req.body };
    songs[songIndex] = new Song(songs[songIndex]);
    fs.writeFile(songsFile, JSON.stringify(songs, null, 2), err => {
      if (err) return res.status(500).send('Fejl ved opdatering');
      res.json(songs[songIndex]);
    });
  });
});

/**
 * @swagger
 * /songs/{id}:
 *   delete:
 *     summary: Slet en sang
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Sangen blev slettet
 */
app.delete('/songs/:id', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    let songs = JSON.parse(data);
    const songId = req.params.id;
    const newSongs = songs.filter(s => s.id != songId);
    fs.writeFile(songsFile, JSON.stringify(newSongs, null, 2), err => {
      if (err) return res.status(500).send('Fejl ved sletning');
      res.sendStatus(204);
    });
  });
});

app.listen(port, () => {
  console.log(`Serveren kører på http://localhost:${port}`);
  console.log(`Tilgå Swagger siden på http://localhost:${port}/api-docs`);
});