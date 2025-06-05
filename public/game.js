const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const players = {};
let myId;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in players) {
    const { x, y } = players[id];
    ctx.fillStyle = id === myId ? "lime" : "red";
    ctx.fillRect(x, y, 20, 20);
  }
  requestAnimationFrame(draw);
}

socket.on("currentPlayers", (data) => {
  Object.assign(players, data);
  myId = socket.id;
  draw();
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

document.addEventListener("keydown", (e) => {
  const movement = { dx: 0, dy: 0 };
  if (e.key === "ArrowUp") movement.dy = -5;
  if (e.key === "ArrowDown") movement.dy = 5;
  if (e.key === "ArrowLeft") movement.dx = -5;
  if (e.key === "ArrowRight") movement.dx = 5;
  socket.emit("move", movement);
});
