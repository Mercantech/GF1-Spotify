#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>
#include <SD.h>
#include <DFRobotDFPlayerMini.h>
#include <Arduino_MKRIoTCarrier.h>
#include <ArduinoSound.h>

char ssid[] = "MAGS-OLC";
char pass[] = "Merc1234!";
char server[] = "172.16.144.85";
int port = 3001;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, server, port);

#define SD_CS_PIN 4 // Skift til din SD kort CS pin

DFRobotDFPlayerMini myDFPlayer;
MKRIoTCarrier carrier;

// Navn på din WAV-fil
const char filename[] = "MUSIC.WAV";
SDWaveFile waveFile;

void setup() {
  Serial.begin(115200);
  while (!Serial);

  // Forbind til WiFi
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Forbinder til WiFi...");
  }
  Serial.println("WiFi forbundet!");

  carrier.noCase();
  carrier.begin(); // SD initialiseres her

  Serial.println("Carrier og SD kort OK!");

  Serial1.begin(9600);
  if (!myDFPlayer.begin(Serial1)) {
    Serial.println("DFPlayer Mini ikke fundet!");
    while (1);
  }
  myDFPlayer.volume(20); // Sæt lydstyrke (0-30)
  Serial.println("DFPlayer Mini klar!");

  // Opret SDWaveFile
  waveFile = SDWaveFile(filename);

  if (!waveFile) {
    Serial.println("WAV fil ikke fundet eller ugyldig!");
    while (1);
  }

  // Sæt lydstyrke (0-100)
  AudioOutI2S.volume(50);

  // Tjek om vi kan afspille filen
  if (!AudioOutI2S.canPlay(waveFile)) {
    Serial.println("Kan ikke afspille WAV fil via I2S!");
    while (1);
  }

  // Start afspilning
  Serial.println("Starter afspilning");
  AudioOutI2S.play(waveFile);
}

void hentOgGemSange() {
  client.get("/api/songs");
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  if (statusCode == 200) {
    StaticJsonDocument<2048> doc;
    DeserializationError error = deserializeJson(doc, response);
    if (error) {
      Serial.print("JSON fejl: ");
      Serial.println(error.c_str());
      return;
    }

    for (JsonObject song : doc.as<JsonArray>()) {
      String title = song["title"];
      String artist = song["artist"];
      String file = song["file"];
      String cover = song["cover"];

      Serial.println("Henter: " + title);

      // Download lydfil
      String lydUrl = "/music/" + file;
      String lydFilnavn = "/" + file;
      downloadFil(lydUrl.c_str(), lydFilnavn.c_str());

      // Download cover
      String coverUrl = "/covers/" + cover;
      String coverFilnavn = "/" + cover;
      downloadFil(coverUrl.c_str(), coverFilnavn.c_str());
    }
  } else {
    Serial.print("Fejl ved GET /api/songs: ");
    Serial.println(statusCode);
  }
}

void downloadFil(const char* url, const char* filnavn) {
  Serial.print("Downloader ");
  Serial.print(url);
  Serial.print(" til ");
  Serial.println(filnavn);

  client.get(url);
  int statusCode = client.responseStatusCode();
  if (statusCode != 200) {
    Serial.print("Fejl ved download: ");
    Serial.println(statusCode);
    return;
  }

  File f = SD.open(filnavn, FILE_WRITE);
  if (!f) {
    Serial.println("Kunne ikke åbne fil på SD kort!");
    return;
  }

  // Læs og skriv data i bidder
  int len = client.contentLength();
  int received = 0;
  const int bufSize = 128;
  uint8_t buf[bufSize];

  while (client.available()) {
    int n = client.read(buf, bufSize);
    if (n > 0) {
      f.write(buf, n);
      received += n;
    }
  }
  f.close();
  Serial.print("Download færdig, bytes: ");
  Serial.println(received);
}

void loop() {
  // Tjek om afspilning er færdig
  if (!AudioOutI2S.isPlaying()) {
    Serial.println("Afspilning færdig");
    while (1);
  }
}