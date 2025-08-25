// Automatisk miljødetektering - ingen config fil nødvendig
const getApiUrl = () => {
  // Hvis vi kører på gf1.mercantec.tech, brug HTTPS
  if (window.location.hostname === 'gf1.mercantec.tech' || 
      window.location.hostname === 'www.gf1.mercantec.tech') {
    return 'https://gf1.mercantec.tech';
  }
  
  // Hvis vi kører lokalt, brug localhost
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Fallback til localhost
  return 'http://gf1.mercantec.tech';
};

const API_URL = getApiUrl();

// Debug: Log API URL
console.log('🔧 Frontend miljø:', window.location.hostname);
console.log('🔧 API URL:', API_URL);

const songListElem = document.getElementById("song-list");
const audioElem = document.getElementById("audio");
const playerCover = document.getElementById("player-cover");
const playerInfo = document.getElementById("player-info");
const playPauseBtn = document.getElementById("play-pause");
const seekBar = document.getElementById("seek-bar");
const currentTimeElem = document.getElementById("current-time");
const durationElem = document.getElementById("duration");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const loader = document.getElementById("loader");
const errorElem = document.getElementById("error");
const searchInput = document.getElementById("search");
const uploadForm = document.getElementById("upload-form");
const openUploadModalBtn = document.getElementById("open-upload-modal");
const uploadModal = document.getElementById("upload-modal");
const closeUploadModalBtn = document.getElementById("close-upload-modal");
const youtubeLinkInput = document.getElementById("youtube-link");
const youtubePreview = document.getElementById("youtube-preview");

let currentSong = null;
let isPlaying = false;
let allSongs = [];

const titleInput = uploadForm ? uploadForm.querySelector('input[name="title"]') : null;
const artistInput = uploadForm ? uploadForm.querySelector('input[name="artist"]') : null;
const thumbnailUrlInput = uploadForm ? uploadForm.querySelector('input[name="thumbnail_url"]') : null;

function formatLength(sec) {
  if (isNaN(sec) || sec === Infinity) return "0:00";
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

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

function renderSongs(songs) {
  songListElem.innerHTML = "";
  if (songs.length === 0) {
    songListElem.innerHTML = "<p>Ingen sange matcher din søgning.</p>";
    return;
  }
  songs.forEach((song) => {
    const div = document.createElement("div");
    div.className = "song";
    if (currentSong && currentSong.id === song.id) div.classList.add("active");
    
    // Tilføj error handling til billede
    const img = document.createElement("img");
    img.src = `${API_URL}/covers/${song.cover}`;
    img.alt = "Cover";
    img.onerror = () => {
      console.error(`❌ Kunne ikke indlæse billede: ${API_URL}/covers/${song.cover}`);
      img.style.display = 'none';
    };
    img.onload = () => {
      console.log(`✅ Billede indlæst: ${API_URL}/covers/${song.cover}`);
    };
    
    div.innerHTML = `
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
      <div class="song-length">${formatLength(song.length)}</div>
    `;
    
    // Indsæt billede først
    div.insertBefore(img, div.firstChild);
    
    div.onclick = () => playSong(song);
    songListElem.appendChild(div);
  });
}

function playSong(song) {
  if (currentSong && currentSong.id === song.id) {
    // Toggle play/pause hvis samme sang
    if (isPlaying) {
      audioElem.pause();
    } else {
      audioElem.play();
    }
    return;
  }
  currentSong = song;
  
  // Brug streaming endpoint for bedre netværksydelse
  // audioElem.src = `${API_URL}/music/${song.file}`;
  audioElem.src = `${API_URL}/api/stream/${song.file}`;
  
  playerCover.src = `${API_URL}/covers/${song.cover}`;
  playerCover.style.display = "block";
  playerInfo.textContent = `${song.title} – ${song.artist}`;
  audioElem.play();
  highlightActiveSong();
  audioElem.onloadedmetadata = () => {
    seekBar.max = Math.floor(audioElem.duration);
    durationElem.textContent = formatLength(audioElem.duration);
    seekBar.value = 0;
    currentTimeElem.textContent = "0:00";
  };
}

function highlightActiveSong() {
  document.querySelectorAll(".song").forEach((div) => {
    div.classList.remove("active");
    if (
      currentSong &&
      div.querySelector(".song-title").textContent === currentSong.title
    ) {
      div.classList.add("active");
    }
  });
}

audioElem.onplay = () => {
  isPlaying = true;
  playIcon.style.display = "none";
  pauseIcon.style.display = "inline";
};
audioElem.onpause = () => {
  isPlaying = false;
  playIcon.style.display = "inline";
  pauseIcon.style.display = "none";
};
playPauseBtn.onclick = () => {
  if (!currentSong) return;
  if (isPlaying) {
    audioElem.pause();
  } else {
    audioElem.play();
  }
};

audioElem.ontimeupdate = () => {
  seekBar.value = Math.floor(audioElem.currentTime);
  currentTimeElem.textContent = formatLength(audioElem.currentTime);
};
seekBar.oninput = () => {
  audioElem.currentTime = seekBar.value;
};
audioElem.onended = () => {
  playIcon.style.display = "inline";
  pauseIcon.style.display = "none";
  isPlaying = false;
};

function filterSongs() {
  const q = searchInput.value.toLowerCase();
  const filtered = allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q)
  );
  renderSongs(filtered);
}
searchInput.addEventListener("input", filterSongs);

function fetchSongs() {
  setLoader(true);
  setError(null);
  fetch(`${API_URL}/api/songs`)
    .then((res) => {
      if (!res.ok) throw new Error("Kunne ikke hente sange fra serveren.");
      return res.json();
    })
    .then((songs) => {
      allSongs = songs;
      renderSongs(songs);
    })
    .catch((err) => {
      setError(err.message);
    })
    .finally(() => setLoader(false));
}

fetchSongs();

if (uploadForm) {
  uploadForm.onsubmit = function (e) {
    e.preventDefault();
    setLoader(true);
    setError(null);
    const formData = new FormData(uploadForm);
    fetch(`${API_URL}/api/songs/upload`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload fejlede");
        return res.json();
      })
      .then((data) => {
        uploadForm.reset();
        fetchSongs();
      })
      .catch((err) => setError("Kunne ikke uploade sang: " + err.message))
      .finally(() => setLoader(false));
  };
}

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
  // Luk modal efter upload
  if (uploadForm) {
    uploadForm.addEventListener("submit", () => {
      uploadModal.classList.add("hidden");
    });
  }
}

async function fetchYoutubePreview(url) {
  // Brug evt. en backend-endpoint til at hente info, men her bruger vi YouTube oEmbed som fallback
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error("Ugyldigt YouTube-link eller video ikke fundet");
    const data = await res.json();
    return {
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url
    };
  } catch (e) {
    return null;
  }
}

if (youtubeLinkInput && youtubePreview) {
  youtubeLinkInput.addEventListener("input", async function () {
    const url = youtubeLinkInput.value.trim();
    youtubePreview.classList.add("hidden");
    youtubePreview.innerHTML = "";
    if (!url) return;
    youtubePreview.innerHTML = "<em>Henter preview...</em>";
    const info = await fetchYoutubePreview(url);
    if (info) {
      youtubePreview.innerHTML = `
        <img src="${info.thumbnail}" alt="Thumbnail" style="width:100%;max-width:320px;border-radius:8px;margin-bottom:0.5em;" />
        <div style="font-weight:bold;">${info.title}</div>
        <div style="color:#b3b3b3;">${info.author}</div>
      `;
      youtubePreview.classList.remove("hidden");
      // Autofyld titel og kunstner hvis de er tomme
      if (titleInput && !titleInput.value) titleInput.value = info.title;
      if (artistInput && !artistInput.value) artistInput.value = info.author;
      // Sæt thumbnail-url i skjult felt
      if (thumbnailUrlInput) thumbnailUrlInput.value = info.thumbnail;
    } else {
      youtubePreview.innerHTML = "<span style='color:#ff4c4c'>Kunne ikke hente preview. Tjek linket.</span>";
      youtubePreview.classList.remove("hidden");
    }
  });
}
