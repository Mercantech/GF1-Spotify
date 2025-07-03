## Del 1 - Opsætning af Node.js server med JS :js:

For at lave en online spotify-klon, skal vi bruge en back-end, altså en server! Her vælger vi at bygge den med node.js som kan kører JavaScript serverside. Vi har valgt det fordi vi også skal bruge det til vores frontend, så vi kun har brug for et programmeringssprog! 

Vi starter med at hente node.js på vores udvikler computer og/eller vores server - https://nodejs.org/en

Herefter skal vi i vores fortrukne terminal navigere hen til den mappe, hvor vi vil have vores projekt liggende. Det kan fx være på Skrivebordet eller i en særlig mappe til skoleprojekter.

---

**1. Opret en ny mappe til projektet:**
```bash
mkdir spotify-klon
cd spotify-klon
```
> 💡 *Opgave: Prøv selv at oprette mappen og gå ind i den via terminalen!*

**2. Initialiser et nyt Node.js projekt:**
```bash
npm init -y
```
Dette opretter en `package.json` fil, som holder styr på projektets indstillinger og afhængigheder.

> 💡 *Opgave: Kig i din mappe – kan du finde filen `package.json`?*

**3. Installer Express (webserver):**
Vi skal bruge Express til at lave vores server. Installer det med:
```bash
npm install express
```
> 💡 *Opgave: Hvad sker der i din mappe, når du kører denne kommando?*

**4. Opret en fil til din serverkode:**
Lav en ny fil, fx `server.js`. Det kan du gøre i din editor eller med terminalen:

På Windows:
- Du kan oprette filen i Stifinder (højreklik > Ny > Tekstdokument, og omdøb til `server.js`),
- eller i terminalen med:
```powershell
New-Item server.js
```

På Mac/Linux:
- Brug kommandoen:
```bash
touch server.js
```

> 💡 *Opgave: Opret filen og åbn den i din editor, så du er klar til at skrive kode!*

**5. Skriv din første serverkode:**
Kopier nedenstående kode ind i `server.js`:

```js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Velkommen til din Spotify-klon!');
});

app.listen(port, () => {
  console.log(`Serveren kører på http://localhost:${port}`);
});
```

> 💡 *Opgave: Prøv at forstå, hvad koden gør. Kan du forklare det med dine egne ord?*

**6. Start serveren:**
Kør følgende i terminalen:
```bash
node server.js
```
Gå derefter ind på [http://localhost:3000](http://localhost:3000) i din browser og se, hvad der sker!

> 💡 *Opgave: Hvad ser du i browseren? Prøv at ændre teksten i `res.send(...)` og genstart serveren for at se ændringen.*

---

## Del 2 - Installation og opsætning af Swagger :bookmark_tabs:

Swagger gør det nemt at dokumentere og teste din API direkte fra browseren. Vi bruger Swagger UI og Swagger JSDoc til at lave dokumentationen automatisk ud fra kommentarer i koden.

---

**1. Installer Swagger afhængigheder:**

```bash
npm install swagger-ui-express swagger-jsdoc
```
> 💡 *Opgave: Kør kommandoen og tjek at der nu er kommet nye pakker i din `node_modules` mappe og i din `package.json`.*

**2. Tilføj Swagger til din server:**
Åbn din `server.js` og indsæt følgende kode (gerne lige efter dine andre `require` statements):

```js
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spotify-klon API',
      version: '1.0.0',
      description: 'API dokumentation for din Spotify-klon',
    },
  },
  apis: ['./server.js'], // Her kan du tilføje flere filer senere
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

> 💡 *Opgave: Prøv at forstå, hvad de forskellige dele af Swagger-opsætningen gør. Hvorfor tror du, vi bruger `/api-docs` som route?*

**3. Tilføj din første Swagger kommentar til en endpoint:**
Lige over din `app.get('/', ...)` kan du tilføje denne kommentar:

```js
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
```

> 💡 *Opgave: Læs kommentaren og se, hvordan den beskriver endpointet. Prøv evt. at ændre teksten og se, hvad der sker i Swagger UI.*

**4. Genstart din server og tilgå Swagger UI:**
Genstart din server med:
```bash
node server.js
```
Gå derefter ind på [http://localhost:3000/api-docs](http://localhost:3000/api-docs) i din browser.

> 💡 *Opgave: Kan du se din API-dokumentation? Prøv at trykke på "GET /" og brug "Try it out" for at teste dit endpoint direkte fra Swagger!*

---

## Del 3 - Brug af Nodemon til automatisk genstart :repeat:

Når du udvikler din server, kan det være irriterende hele tiden at skulle stoppe og starte serveren manuelt, hver gang du laver en ændring i koden. Her kommer nodemon til undsætning!

---

**1. Installer nodemon som udviklingsafhængighed:**

```bash
npm install --save-dev nodemon
```
> 💡 *Opgave: Hvad betyder det, at vi bruger `--save-dev`? Hvorfor installerer vi ikke nodemon som en "almindelig" afhængighed?*

**2. Tilføj en script-kommando til din `package.json`:**
Åbn din `package.json` og find feltet `"scripts"`. Tilføj denne linje (eller ret evt. den eksisterende `start`-linje):

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
> 💡 *Opgave: Hvad er forskellen på `npm start` og `npm run dev` nu?*

**3. Brug nodemon til at starte din server:**
Kør følgende i terminalen:
```bash
npm run dev
```
Nu vil din server automatisk genstarte, hver gang du gemmer ændringer i dine filer!

> 💡 *Opgave: Prøv at lave en ændring i din `server.js` og se, om nodemon genstarter serveren automatisk.*

---

## Del 4 - CRUD mod en lokal JSON-fil :cd:

Nu skal vi lave det, der gør vores Spotify-klon spændende: Vi skal kunne tilføje, læse, opdatere og slette musiknumre! Vi gemmer informationen i en lokal JSON-fil, så vi ikke behøver en database.

---

**1. Opret en mappe og en JSON-fil til dine sange:**

```bash
mkdir backend/data
```
Opret filen `songs.json` i mappen `backend/data` med følgende indhold:

```json
[]
```
> 💡 *Opgave: Opret mappen og filen, og sørg for at filen starter som et tomt array.*

**2. Tilføj endpoints til CRUD i din `server.js`:**
Vi bruger Node.js' indbyggede `fs`-modul til at læse og skrive til JSON-filen.

Tilføj øverst i din `server.js`:
```js
const fs = require('fs');
const path = require('path');
const songsFile = path.join(__dirname, 'backend/data/songs.json');
```

---

### a) Læs alle sange (GET)

```js
app.get('/songs', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    const songs = JSON.parse(data);
    res.json(songs);
  });
});
```
> 💡 *Opgave: Prøv at lave et GET request til `/songs` (fx via Swagger eller Postman) og se, hvad du får retur!*

---

### b) Tilføj en ny sang (POST)

```js
app.use(express.json()); // Husk denne linje, hvis du ikke allerede har den!

app.post('/songs', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    const songs = JSON.parse(data);
    const newSong = req.body;
    songs.push(newSong);
    fs.writeFile(songsFile, JSON.stringify(songs, null, 2), err => {
      if (err) return res.status(500).send('Fejl ved gemning af sang');
      res.status(201).json(newSong);
    });
  });
});
```
> 💡 *Opgave: Prøv at lave et POST request til `/songs` med fx titel, kunstner og filnavn på MP3 og cover. Tjek at sangen bliver gemt i din JSON-fil!*

---

### c) Opdater en sang (PUT)

```js
app.put('/songs/:id', (req, res) => {
  fs.readFile(songsFile, (err, data) => {
    if (err) return res.status(500).send('Fejl ved læsning af sange');
    let songs = JSON.parse(data);
    const songId = req.params.id;
    const songIndex = songs.findIndex(s => s.id == songId);
    if (songIndex === -1) return res.status(404).send('Sang ikke fundet');
    songs[songIndex] = { ...songs[songIndex], ...req.body };
    fs.writeFile(songsFile, JSON.stringify(songs, null, 2), err => {
      if (err) return res.status(500).send('Fejl ved opdatering');
      res.json(songs[songIndex]);
    });
  });
});
```
> 💡 *Opgave: Prøv at opdatere en sang ved at sende et PUT request til `/songs/:id` med nye informationer!*

---

### d) Slet en sang (DELETE)

```js
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
```
> 💡 *Opgave: Prøv at slette en sang med DELETE og se, om den forsvinder fra din JSON-fil!*

---

## Samlet server.js efter trin 3

```js
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
```

---

## Ekstra: Brug en model til dine sange

For at gøre din kode mere struktureret, kan du lave en model (klasse) for dine sange. Det gør det nemmere at sikre, at alle sange har samme struktur, og det bliver lettere at udvide senere.

**1. Tilføj en Song-model øverst i din `server.js`:**
```js
class Song {
  constructor({ id, title, artist, mp3, cover }) {
    this.id = id || Date.now().toString();
    this.title = title;
    this.artist = artist;
    this.mp3 = mp3;
    this.cover = cover;
  }
}
```

**2. Brug modellen i dine endpoints:**
Når du opretter eller opdaterer en sang, skal du bruge modellen:

```js
// POST - tilføj en ny sang
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

// PUT - opdater en sang
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
```

> 💡 *Fordel: Du sikrer, at alle sange har samme struktur og kan nemt udvide modellen senere, fx med flere felter eller metoder.*