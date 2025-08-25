# GF1 Spotify Klon

En Spotify-klon bygget med Node.js backend og HTML/CSS/JavaScript frontend.

## Backend med Docker

### Forudsætninger
- Docker og Docker Compose installeret på din maskine

### Start backend med Docker
```bash
# Byg og start containeren
docker-compose up --build

# Eller kør i baggrunden
docker-compose up -d --build
```

### Tilgå applikationen
- Backend API: http://localhost:3001
- Swagger dokumentation: http://localhost:3001/api-docs/

### Netværkstilgang (fra andre enheder)
Backend'en kan nu tilgås fra andre enheder på dit netværk med forbedret filhåndtering:

1. **Find din maskines IP-adresse:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   # eller
   ip addr show
   ```

2. **Opdater frontend/config.js:**
   ```javascript
   const CONFIG = {
     API_URL_LOCAL: "http://localhost:3001",
     API_URL_NETWORK: "http://192.168.1.100:3001", // Erstat med din IP
     USE_NETWORK: true // Skift til true
   };
   ```

3. **Tilgå fra andre enheder:**
   - Backend API: `http://[DIN_IP]:3001`
   - Frontend: Åbn `frontend/index.html` på den anden enhed

### Forbedret filhåndtering
- **Streaming endpoint**: `/api/stream/:filename` med range request support
- **Caching**: MP3-filer caches i 1 dag, billeder i 7 dage
- **Komprimering**: Automatisk gzip komprimering af alle responses
- **Range requests**: Understøtter audio streaming og seek funktionalitet

### Stop containeren
```bash
docker-compose down
```

### Se logs
```bash
docker-compose logs -f backend
```

## Manuel installation (uden Docker)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
Åbn `frontend/index.html` i din browser.

## API Endpoints

- `GET /api/songs` - Hent alle sange
- `GET /api/songs/:id` - Hent specifik sang
- `GET /api/stream/:filename` - Stream MP3-fil med range support
- `POST /api/songs/upload` - Upload ny sang med MP3 og cover
- `POST /api/songs/youtube` - Hent sang fra YouTube-link

## Funktioner

- Afspil MP3-filer med streaming
- Upload nye sange
- Hent sange fra YouTube
- Swagger API dokumentation
- Responsivt design
- Netværkstilgang til backend
- Avanceret caching og komprimering
- Range request support for audio
