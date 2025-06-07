const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const background = new Image();
background.src = 'images/patron.png';

const directions = ['up', 'down', 'left', 'right'];
const roles = ['bob', 'patrick', 'sandy', 'carlo'];

const playerSprites = {};

// Charger toutes les combinaisons
roles.forEach(role => {
  playerSprites[role] = {};
  directions.forEach(dir => {
    const img = new Image();
    img.src = `images/${role}-${dir}.png`;
    playerSprites[role][dir] = img;
  });
});

const players = {};
let myId;

const TILE_SIZE_X = 96;
const TILE_SIZE_Y = 69;
const GRID_WIDTH = 11;
const GRID_HEIGHT = 8;

// 0 = vide, 1 = mur fixe, 2 = mur destructible
const mapGrid = [
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,1,0,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,1,0,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,1,0,1,0,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];

function drawMap() {
  for (let row = 0; row < GRID_HEIGHT; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      const tile = mapGrid[row][col];
      const x = 186 + (col * TILE_SIZE_X);
      const y = 77 + (row * TILE_SIZE_Y);

      if (tile === 1) {
        ctx.fillStyle = "#444"; // mur fixe
        ctx.fillRect(x, y, TILE_SIZE_X, TILE_SIZE_Y);
      } else if (tile === 2) {
        ctx.fillStyle = "#999"; // mur destructible
        ctx.fillRect(x, y, TILE_SIZE_X, TILE_SIZE_Y);
      } else {
        // vide : facultatif de dessiner quoi que ce soit
      }
    }
  }
}


window.addEventListener("click", () => {
  const audio = document.getElementById("themeMusic");
  if (audio.paused) {
    audio.play();
  }
});


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayers();
  requestAnimationFrame(draw);
}

function drawPlayers() {
  for (const id in players) {
    const player = players[id];
    const role = player.role || "bob";
    const dir = player.direction || "down";

    const spriteSet = playerSprites[role];
    const img = spriteSet ? spriteSet[dir] : null;

    if (img && img.complete) {
      ctx.drawImage(img, player.x-50, player.y-70, 110, 110);
    } else {
      // fallback : carré temporaire si image absente
      ctx.fillStyle = "orange";
      ctx.fillRect(player.x, player.y, 32, 32);
    }
  }
}

function getPlayerGridPosition(player) {
  const col = Math.floor(player.x / TILE_SIZE);
  const row = Math.floor(player.y / TILE_SIZE);
  return { row, col };
}

function getMapState() {
  return JSON.parse(JSON.stringify(mapGrid)); // copie propre
}

socket.on("currentPlayers", (data) => {
  Object.assign(players, data);
    myId = socket.id;
   myRole = players[myId].role;
  draw();
  drawPlayers();
});

socket.on("newPlayer", (player) => {
  players[player.id] = player;
});

socket.on("playerMoved", (player) => {
  if (players[player.id]) {
    players[player.id] = player;
  }
});

socket.on("playerDisconnected", (id) => {
  delete players[id];
});