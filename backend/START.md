# Backend Start Guide

## Start backend serveren

1. **Åbn en terminal/kommandoprompt**
2. **Naviger til backend mappen:**
   ```bash
   cd backend
   ```
3. **Installer dependencies (hvis du ikke har gjort det før):**
   ```bash
   npm install
   ```
4. **Start serveren:**
   ```bash
   npm start
   ```

## Serveren kører nu på:
- **API:** http://localhost:3001
- **Swagger dokumentation:** http://localhost:3001/api-docs

## Test CORS
Åbn `frontend/test-cors.html` i din browser for at teste om CORS virker korrekt.

## Fejlfinding
Hvis du får fejl:
- Tjek at port 3001 ikke er i brug
- Tjek at alle dependencies er installeret
- Tjek console output for fejlmeddelelser
