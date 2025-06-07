const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {}; // id -> data
const playerSlots = []; // socket.id ordered
const startPositions = [
  { x: 230, y: 110, tileX: 0, tileY: 0 }, // J1
  { x: 1190, y: 110, tileX: 0, tileY: 10 }, // J2
  { x: 230, y: 590, tileX: 7, tileY: 0 }, // J3
  { x: 1190, y: 590, tileX: 7, tileY: 10 }  // J4
];
const characterRoles = ['bob', 'patrick', 'sandy', 'carlo'];

io.on("connection", (socket) => {
  console.log("Connexion entrante :", socket.id);

  if (playerSlots.length >= 4) {
    console.log("Connexion refusée : 4 joueurs déjà présents.");
    socket.emit("full");
    socket.disconnect(true);
    return;
  }

  const slotIndex = playerSlots.length;
  const startPos = startPositions[slotIndex];
  const role = characterRoles[slotIndex];

  playerSlots.push(socket.id);
  players[socket.id] = {
    x: startPos.x, 
    y: startPos.y, 
    tileX: startPos.tileX,
    tileY: startPos.tileY,
    slot: slotIndex + 1,
    role: role,
    dir: 'down',
    };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

    socket.on("move", (data) => {
        const player = players[socket.id];
        if (player) {
            console.log("tile X : " + player.tileX + " tile Y : " + player.tileY)
            const newX = player.x + data.dx;
            const newY = player.y + data.dy;
            if(newX > player.x && player.tileX != 10){
                player.x = newX;
                player.tileX++;
            }else if(newX < player.x && player.tileX != 0){
                player.x = newX;
                player.tileX--;
            }
            if(newY > player.y && player.tileY != 7){
                player.y = newY;
                player.tileY++;
            }else if(newY < player.y && player.tileY != 0){
                player.y = newY;
                player.tileY--;
            }
            player.direction = data.direction || "down";

            io.emit("playerMoved", {
                id: socket.id,
                ...player
            });
        }   
    });

  socket.on("disconnect", () => {
    console.log("Déconnexion :", socket.id);
    const index = playerSlots.indexOf(socket.id);
    if (index !== -1) playerSlots.splice(index, 1);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Serveur en écoute sur http://localhost:3000");
});
