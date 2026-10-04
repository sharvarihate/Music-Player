// ===== Playlist: replace src with your own files, e.g. "audio/song1.mp3" =====
const songs = [
    { title: "Song One",   artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Song Two",   artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Song Three", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { title: "Song Four",  artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ];
  
  const audio    = document.getElementById("audio");
  const titleEl  = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const coverEl  = document.getElementById("cover");
  const playBtn  = document.getElementById("play");
  const prevBtn  = document.getElementById("prev");
  const nextBtn  = document.getElementById("next");
  const muteBtn  = document.getElementById("mute");
  const autoBtn  = document.getElementById("shuffle");
  const progress = document.getElementById("progress");
  const volume   = document.getElementById("volume");
  const currentEl  = document.getElementById("current");
  const durationEl = document.getElementById("duration");
  const listEl   = document.getElementById("playlist");
  
  let index = 0;
  let autoplay = true;
  
  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${sec}`;
  };
  
  const setFill = (el) => {
    const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty("--fill", pct + "%");
  };
  
  // Build playlist UI
  function renderPlaylist() {
    listEl.innerHTML = "";
    songs.forEach((song, i) => {
      const li = document.createElement("li");
      li.tabIndex = 0;
      li.innerHTML = `<span>${song.title}<small>${song.artist}</small></span>`;
      li.addEventListener("click", () => { loadSong(i); play(); });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { loadSong(i); play(); }
      });
      listEl.appendChild(li);
    });
  }
  
  function loadSong(i) {
    index = (i + songs.length) % songs.length;
    const song = songs[index];
    audio.src = song.src;
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    progress.value = 0;
    setFill(progress);
    currentEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    [...listEl.children].forEach((li, n) => li.classList.toggle("active", n === index));
  }
  
  function play() {
    audio.play().catch(() => {});
  }
  function pause() { audio.pause(); }
  
  playBtn.addEventListener("click", () => (audio.paused ? play() : pause()));
  nextBtn.addEventListener("click", () => { loadSong(index + 1); play(); });
  prevBtn.addEventListener("click", () => {
    // restart song if past 3s, otherwise go to previous
    if (audio.currentTime > 3) audio.currentTime = 0;
    else { loadSong(index - 1); play(); }
  });
  
  audio.addEventListener("play", () => {
    playBtn.textContent = "⏸";
    playBtn.setAttribute("aria-label", "Pause");
    coverEl.classList.add("playing");
  });
  audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
    coverEl.classList.remove("playing");
  });
  
  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = fmt(audio.duration);
  });
  
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    setFill(progress);
    currentEl.textContent = fmt(audio.currentTime);
  });
  
  // Seek
  progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
    setFill(progress);
  });
  
  // Volume
  volume.addEventListener("input", () => {
    audio.volume = volume.value;
    audio.muted = false;
    muteBtn.textContent = audio.volume === 0 ? "🔇" : "🔊";
    setFill(volume);
  });
  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? "🔇" : "🔊";
  });
  
  // Autoplay toggle (bonus)
  autoBtn.addEventListener("click", () => {
    autoplay = !autoplay;
    autoBtn.setAttribute("aria-pressed", autoplay);
  });
  
  // When a song ends, go to the next one
  audio.addEventListener("ended", () => {
    if (autoplay) { loadSong(index + 1); play(); }
  });
  
  // Keyboard shortcuts: Space = play/pause, arrows = next/prev
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); playBtn.click(); }
    if (e.code === "ArrowRight") nextBtn.click();
    if (e.code === "ArrowLeft") prevBtn.click();
  });
  
  // Init
  audio.volume = volume.value;
  setFill(volume);
  renderPlaylist();
  loadSong(0);