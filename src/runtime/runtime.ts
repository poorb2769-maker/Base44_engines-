import GameRuntime from './GameRuntime';

// Initialize game runtime
const gameRuntime = new GameRuntime('viewport');

// Setup controls
const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
const btnStop = document.getElementById('btn-stop') as HTMLButtonElement;

let isPlaying = false;

btnPlay.addEventListener('click', () => {
  gameRuntime.play();
  isPlaying = true;
  btnPlay.disabled = true;
  btnPause.disabled = false;
});

btnPause.addEventListener('click', () => {
  gameRuntime.pause();
  isPlaying = false;
  btnPlay.disabled = false;
  btnPause.disabled = true;
});

btnStop.addEventListener('click', () => {
  gameRuntime.stop();
  isPlaying = false;
  btnPlay.disabled = false;
  btnPause.disabled = true;
});

// Update stats
setInterval(() => {
  const stats = gameRuntime.getPerformanceStats();
  document.getElementById('fps')!.textContent = `FPS: ${stats.fps}`;
  document.getElementById('memory')!.textContent = `Memory: ${stats.memory} MB`;
  document.getElementById('entities')!.textContent = `Entities: ${stats.entities}`;
}, 1000);

// Load a test scene
const loadTestScene = async () => {
  // TODO: Load scene from JSON or server
};

loadTestScene();
