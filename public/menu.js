function onStory() {
    alert("Story sélectionnée !");
}
function onHowToPlay() {
  alert("How to Play sélectionné !");
}
function onHighscores() {
  alert("Highscores sélectionné !");
}
function onPlay() {
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const canvas = document.getElementById("gameCanvas");
  // Fade out du menu
  menu.classList.add('fade-out');

  setTimeout(() => {
      menu.style.display = 'none';
      game.style.display = 'block';
      game.style.opacity = 1;

      // Fade in du jeu
      setTimeout(() => {
        game.classList.add('fade-in');
        canvas.style.display = 'block';
      }, 500);
  }, 1000); // temps du fade-out
}