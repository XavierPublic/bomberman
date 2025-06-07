document.addEventListener("keydown", (e) => {
  let dx = 0, dy = 0;
  let direction = "down"; // par défaut

  if (e.key === "ArrowUp") {
    dy = -69; direction = "up";
  } else if (e.key === "ArrowDown") {
    dy = 69; direction = "down";
  } else if (e.key === "ArrowLeft") {
    dx = -96; direction = "left";
  } else if (e.key === "ArrowRight") {
    dx = 96; direction = "right";
  } else {
    return;
  }

  socket.emit("move", { dx, dy, direction });

  // Met à jour direction locale pour affichage immédiat
  if (players[socket.id]) {
    players[socket.id].direction = direction;
  }
});