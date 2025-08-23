const API_URL = "http://localhost:3001";

const songListElem = document.getElementById("song-list");
const loader = document.getElementById("loader");
const errorElem = document.getElementById("error");
const openUploadModalBtn = document.getElementById("open-upload-modal");
const uploadModal = document.getElementById("upload-modal");
const closeUploadModalBtn = document.getElementById("close-upload-modal");

function setLoader(visible) {
  loader.classList.toggle("hidden", !visible);
}

function setError(msg) {
  if (msg) {
    errorElem.textContent = msg;
    errorElem.classList.remove("hidden");
  } else {
    errorElem.classList.add("hidden");
  }
}

// Funktion til at tjekke server status
function checkHealth() {
  setLoader(true);
  setError(null);
  
  fetch(`${API_URL}/api/health`)
    .then((res) => {
      if (!res.ok) throw new Error("Server er ikke tilgængelig");
      return res.json();
    })
    .then((data) => {
      if (data.status === "OK") {
        songListElem.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #1db954;">
            <h2>✅ Server Status: ${data.status}</h2>
            <p>${data.message}</p>
            <p><strong>Database:</strong> ${data.database}</p>
            <p><small>Sidste tjek: ${new Date(data.timestamp).toLocaleString('da-DK')}</small></p>
            <p style="margin-top: 2rem; color: #b3b3b3;">
              Din Spotify-klon starter template er klar til udvikling!
            </p>
          </div>
        `;
      } else {
        setError(`Server fejl: ${data.message}`);
      }
    })
    .catch((err) => {
      setError("Kunne ikke forbinde til serveren: " + err.message);
      songListElem.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ff4c4c;">
          <h2>❌ Server ikke tilgængelig</h2>
          <p>Sørg for at backend serveren kører på http://localhost:3001</p>
        </div>
      `;
    })
    .finally(() => setLoader(false));
}

// Kør health check når siden loader
checkHealth();

// Modal funktionalitet (behold designet)
if (openUploadModalBtn && uploadModal && closeUploadModalBtn) {
  openUploadModalBtn.onclick = () => {
    uploadModal.classList.remove("hidden");
  };
  closeUploadModalBtn.onclick = () => {
    uploadModal.classList.add("hidden");
  };
  // Luk modal hvis man klikker udenfor modal-content
  uploadModal.onclick = (e) => {
    if (e.target === uploadModal) {
      uploadModal.classList.add("hidden");
    }
  };
}
