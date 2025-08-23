const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Healthcheck endpoint - tjekker om serveren kører og om songs.json findes
app.get("/api/health", (req, res) => {
  const songsPath = path.join(__dirname, "data", "songs.json");
  
  try {
    // Tjek om songs.json findes
    const fileExists = fs.existsSync(songsPath);
    
    if (fileExists) {
      // Prøv at læse filen for at sikre den er valid JSON
      const data = fs.readFileSync(songsPath, "utf8");
      JSON.parse(data); // Dette vil kaste en fejl hvis JSON ikke er valid
      
      res.json({
        status: "OK",
        message: "Server kører og songs.json er tilgængelig",
        timestamp: new Date().toISOString(),
        database: "connected"
      });
    } else {
      res.status(503).json({
        status: "ERROR",
        message: "songs.json filen findes ikke",
        timestamp: new Date().toISOString(),
        database: "disconnected"
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Fejl ved læsning af songs.json: " + error.message,
      timestamp: new Date().toISOString(),
      database: "error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}`);
  console.log(`Health check tilgængelig på: http://localhost:${PORT}/api/health`);
});
