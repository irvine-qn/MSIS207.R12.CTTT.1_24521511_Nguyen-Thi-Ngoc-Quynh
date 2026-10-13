const drumPads = document.querySelectorAll(".key");

drumPads.forEach((pad) => {
  pad.addEventListener("click", () => {
    playVisualEffect(pad);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  const keyCode = event.keyCode;
  const pad = document.querySelector(`.key[data-key="${keyCode}"]`);

  if (!pad) return;

  playVisualEffect(pad);
});

function playVisualEffect(pad) {
  pad.classList.add("playing");

  setTimeout(() => {
    pad.classList.remove("playing");
  }, 120);
}
