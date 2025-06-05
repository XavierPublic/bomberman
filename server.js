const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const players = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Nouvelle connexion :", socket.id);

  players[socket.id] = { x: 50, y: 50 };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x += data.dx;
      players[socket.id].y += data.dy;
      io.emit("playerMoved", { id: socket.id, ...players[socket.id] });
    }
  });

  socket.on("disconnect", () => {
    console.log("Déconnexion :", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
