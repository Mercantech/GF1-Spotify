// Konfigurationsfil til API URL
// Ændr denne værdi for at tilgå backend fra andre enheder på netværket

const CONFIG = {
  // For lokal udvikling (samme maskine)
  API_URL_LOCAL: "http://localhost:3001",
  
  // For netværkstilgang - erstat med din maskines IP-adresse
  API_URL_NETWORK: "http://192.168.1.100:3001", // Ændr til din IP
  
  // Vælg hvilken URL der skal bruges
  // true = netværkstilgang, false = lokal tilgang
  USE_NETWORK: false
};

// Eksporter den aktive API URL
const API_URL = CONFIG.USE_NETWORK ? CONFIG.API_URL_NETWORK : CONFIG.API_URL_LOCAL;

// Hvis du bruger ES6 modules, brug: export { API_URL };
// Eller tilføj denne linje i din HTML: <script src="config.js"></script>
