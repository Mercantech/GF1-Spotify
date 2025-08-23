const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const multer = require("multer");
const fetch = require("node-fetch");
let mm;
(async () => {
  mm = await import("music-metadata");
})();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Statisk adgang til musik og covers
app.use("/music", express.static(path.join(__dirname, "music")));
app.use("/covers", express.static(path.join(__dirname, "covers")));

// Hent alle sange
app.get("/api/songs", (req, res) => {
  fs.readFile(
    path.join(__dirname, "data", "songs.json"),
    "utf8",
    (err, data) => {
      if (err) return res.status(500).json({ error: "Kan ikke læse sangdata" });
      res.json(JSON.parse(data));
    }
  );
});

// Hent metadata for én sang
app.get("/api/songs/:id", (req, res) => {
  fs.readFile(
    path.join(__dirname, "data", "songs.json"),
    "utf8",
    (err, data) => {
      if (err) return res.status(500).json({ error: "Kan ikke læse sangdata" });
      const songs = JSON.parse(data);
      const song = songs.find((s) => s.id === parseInt(req.params.id));
      if (!song) return res.status(404).json({ error: "Sang ikke fundet" });
      res.json(song);
    }
  );
});

const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "file") cb(null, path.join(__dirname, "music"));
    else if (file.fieldname === "cover")
      cb(null, path.join(__dirname, "covers"));
    else cb(new Error("Ugyldigt feltnavn"));
  },
  filename: (req, file, cb) => {
    // Gem originalt filnavn
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: musicStorage });

/**
 * Upload en ny sang (MP3 og cover)
 * Forventer multipart/form-data med felterne:
 * - title (string)
 * - artist (string)
 * - length (number, sekunder)
 * - file (mp3)
 * - cover (billede)
 */
app.post(
  "/api/songs/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, artist, thumbnail_url } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: "Mangler data" });
    }
    // Navngiv filerne pænt
    function safeName(str) {
      return str.replace(/[^a-zA-Z0-9æøåÆØÅ _-]/g, "").replace(/\s+/g, " ").trim();
    }
    const baseName = `${safeName(artist)} - ${safeName(title)}`;
    let fileName = baseName + ".mp3";
    let coverName = baseName + ".jpg";
    let mp3Path = req.files.file ? path.join(__dirname, "music", fileName) : null;
    let coverPath = req.files.cover ? path.join(__dirname, "covers", coverName) : null;
    // Hvis thumbnail_url er sat, hent billedet og gem som cover
    if (thumbnail_url) {
      try {
        const response = await fetch(thumbnail_url);
        if (!response.ok) throw new Error("Kunne ikke hente thumbnail");
        const buffer = await response.buffer();
        fs.writeFileSync(path.join(__dirname, "covers", coverName), buffer);
        coverPath = path.join(__dirname, "covers", coverName);
      } catch (e) {
        return res.status(500).json({ error: "Kunne ikke hente thumbnail fra URL" });
      }
    }
    // Gem lydfil med nyt navn hvis uploadet
    if (req.files.file) {
      fs.renameSync(req.files.file[0].path, mp3Path);
    }
    // Gem cover hvis uploadet manuelt
    if (req.files.cover && !thumbnail_url) {
      fs.renameSync(req.files.cover[0].path, coverPath);
    }
    // Læs længde
    let length = 0;
    try {
      const metadata = await mm.parseFile(mp3Path);
      length = Math.round(metadata.format.duration || 0);
    } catch (e) {
      return res.status(500).json({ error: "Kunne ikke læse længde på MP3" });
    }
    fs.readFile(
      path.join(__dirname, "data", "songs.json"),
      "utf8",
      (err, data) => {
        if (err)
          return res.status(500).json({ error: "Kan ikke læse sangdata" });
        let songs = JSON.parse(data);
        const newId =
          songs.length > 0 ? Math.max(...songs.map((s) => s.id)) + 1 : 1;
        const newSong = {
          id: newId,
          title,
          artist,
          length,
          file: fileName,
          cover: coverName,
        };
        songs.push(newSong);
        fs.writeFile(
          path.join(__dirname, "data", "songs.json"),
          JSON.stringify(songs, null, 2),
          (err2) => {
            if (err2)
              return res.status(500).json({ error: "Kunne ikke gemme sang" });
            res.json({ success: true, song: newSong });
          }
        );
      }
    );
  }
);

/**
 * YouTube download funktion (deaktiveret)
 * Denne funktion kræver Python og yt-dlp som ikke er installeret
 */
app.post("/api/songs/youtube", async (req, res) => {
  res.status(501).json({ 
    error: "YouTube download er ikke tilgængelig. Upload venligst MP3-filer direkte via /api/songs/upload endpoint.",
    message: "Denne funktion kræver Python og yt-dlp som ikke er installeret på systemet."
  });
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Spotify-klon API",
      version: "1.0.0",
      description: "API dokumentation for Spotify-klon",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: [__filename],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Hent alle sange
 *     responses:
 *       200:
 *         description: En liste af sange
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   length:
 *                     type: integer
 *                   file:
 *                     type: string
 *                   cover:
 *                     type: string
 */

/**
 * @swagger
 * /api/songs/{id}:
 *   get:
 *     summary: Hent metadata for én sang
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Metadata for én sang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 artist:
 *                   type: string
 *                 length:
 *                   type: integer
 *                 file:
 *                   type: string
 *                 cover:
 *                   type: string
 *       404:
 *         description: Sang ikke fundet
 */

/**
 * @swagger
 * /api/songs/upload:
 *   post:
 *     summary: Upload en ny sang (MP3 og cover)
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               length:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Sangen blev uploadet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 song:
 *                   type: object
 *       400:
 *         description: Mangler data eller filer
 *       500:
 *         description: Serverfejl
 */

/**
 * @swagger
 * /api/songs/youtube:
 *   post:
 *     summary: Hent og upload sang fra YouTube-link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               youtubeUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=..."
 *     responses:
 *       200:
 *         description: Sangen blev hentet og gemt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 song:
 *                   type: object
 *       400:
 *         description: Mangler YouTube-link
 *       500:
 *         description: Serverfejl eller ugyldigt YouTube-link
 */

app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}/api-docs/`);
});
