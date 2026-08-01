const form = document.querySelector("#prediction-form");
const homeSelect = document.querySelector("#home-team");
const awaySelect = document.querySelector("#away-team");
const submitButton = document.querySelector("#predict-button");
const swapButton = document.querySelector("#swap-teams");
const results = document.querySelector("#results");
const errorMessage = document.querySelector("#form-error");

const teamAssets = {
  Angers: "angers",
  Auxerre: "auxerre",
  Brest: "brest",
  "Le Havre": "le-havre",
  Lens: "lens",
  Lille: "lille",
  Lorient: "lorient",
  Lyon: "lyon",
  Marseille: "marseille",
  Metz: "metz",
  Monaco: "monaco",
  Nantes: "nantes",
  Nice: "nice",
  "Paris FC": "paris-fc",
  "Paris SG": "paris-sg",
  Rennes: "rennes",
  Strasbourg: "strasbourg",
  Toulouse: "toulouse",
};

function initials(team) {
  const aliases = {
    "Paris SG": "PSG",
    "Paris FC": "PFC",
    Marseille: "OM",
    Monaco: "ASM",
    Lyon: "OL",
    Lille: "LOSC",
    "Le Havre": "HAC",
  };

  if (aliases[team]) return aliases[team];
  return team
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

function paintCrest(container, team, { draw = false } = {}) {
  const image = container.querySelector("img");
  const fallback = container.querySelector(".crest-fallback");

  container.classList.toggle("is-draw", draw);
  container.classList.remove("is-fallback");
  fallback.textContent = draw ? "X" : initials(team);

  if (draw || !teamAssets[team]) {
    image.removeAttribute("src");
    image.alt = "";
    container.classList.add("is-fallback");
    return;
  }

  image.onload = () => container.classList.remove("is-fallback");
  image.onerror = () => container.classList.add("is-fallback");
  image.src = `/assets/teams/${teamAssets[team]}.png`;
  image.alt = `${team} crest`;
}

function syncCrests() {
  paintCrest(document.querySelector("#home-crest"), homeSelect.value);
  paintCrest(document.querySelector("#away-crest"), awaySelect.value);
}

function setOptions(select, teams, preferredTeam) {
  select.replaceChildren(
    ...teams.map((team) => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = team;
      option.selected = team === preferredTeam;
      return option;
    }),
  );
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("is-loading", isLoading);
  submitButton.querySelector(".button-label").textContent = isLoading
    ? "Calculating"
    : "Reveal forecast";
}

function formatProbability(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function renderResults(data) {
  const { home_team: homeTeam, away_team: awayTeam, probabilities, prediction } = data;
  const predictionKey = { H: "home", D: "draw", A: "away" }[prediction.class];
  const displayWinner = prediction.class === "D" ? "a draw" : prediction.label;

  document.querySelector("#fixture-label").textContent = `${homeTeam}  /  ${awayTeam}`;
  document.querySelector("#home-result-label").textContent = homeTeam;
  document.querySelector("#away-result-label").textContent = awayTeam;
  document.querySelector("#winner-label").textContent = displayWinner;

  paintCrest(
    document.querySelector("#winner-crest"),
    prediction.label,
    { draw: prediction.class === "D" },
  );

  const bestProbability = probabilities[predictionKey];
  document.querySelector("#confidence-copy").textContent =
    `${formatProbability(bestProbability)} predicted probability`;

  for (const outcome of ["home", "draw", "away"]) {
    document.querySelector(`#${outcome}-probability`).textContent =
      formatProbability(probabilities[outcome]);
    document.querySelector(`[data-outcome="${outcome}"]`).classList.toggle(
      "is-winner",
      outcome === predictionKey,
    );
  }

  results.hidden = false;
  results.classList.remove("is-visible");
  window.requestAnimationFrame(() => {
    results.classList.add("is-visible");
    window.requestAnimationFrame(() => {
      for (const outcome of ["home", "draw", "away"]) {
        document.querySelector(`#${outcome}-bar`).style.width =
          `${probabilities[outcome] * 100}%`;
      }
    });
  });
}

async function requestPrediction({ scroll = true } = {}) {
  clearError();

  if (homeSelect.value === awaySelect.value) {
    showError("Choose two different teams.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        home_team: homeSelect.value,
        away_team: awaySelect.value,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "The forecast could not be calculated.");
    }

    renderResults(data);
    if (scroll && window.innerWidth < 760) {
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    showError(error.message || "The forecast service is temporarily unavailable.");
  } finally {
    setLoading(false);
  }
}

async function initialize() {
  try {
    const response = await fetch("/api/teams");
    if (!response.ok) throw new Error();
    const { teams } = await response.json();

    setOptions(homeSelect, teams, teams.includes("Paris SG") ? "Paris SG" : teams[0]);
    setOptions(
      awaySelect,
      teams,
      teams.includes("Marseille") ? "Marseille" : teams.find((team) => team !== homeSelect.value),
    );

    homeSelect.disabled = false;
    awaySelect.disabled = false;
    submitButton.disabled = false;
    syncCrests();
    await requestPrediction({ scroll: false });
  } catch {
    showError("Unable to load the clubs. Please try again in a moment.");
  }
}

function finishIntro() {
  const intro = document.querySelector("#intro");
  document.documentElement.classList.remove("intro-pending");
  document.body.classList.add("intro-complete");
  intro.hidden = true;
}

async function playIntro() {
  const intro = document.querySelector("#intro");
  const backdrop = intro.querySelector(".intro-backdrop");
  const grid = intro.querySelector(".intro-grid");
  const wordmark = intro.querySelector(".intro-wordmark");
  const ball = document.querySelector("#intro-ball");
  const landing = document.querySelector("#hero-ball");
  const skip = document.querySelector("#skip-intro");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    finishIntro();
    return;
  }

  skip.tabIndex = 0;
  skip.addEventListener("click", finishIntro, { once: true });

  try {
    await Promise.race([
      ball.decode(),
      new Promise((resolve) => window.setTimeout(resolve, 700)),
    ]);
  } catch {
    // The animation can still run while the browser completes the image load.
  }

  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  const landingBox = landing.getBoundingClientRect();
  const baseSize = ball.offsetWidth;
  const destinationX = landingBox.left + landingBox.width / 2 - window.innerWidth / 2;
  const destinationY = landingBox.top + landingBox.height / 2 - window.innerHeight / 2;
  const destinationScale = landingBox.width / baseSize;

  const backdropAnimation = backdrop.animate(
    [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.42 },
      { opacity: 0, offset: 1 },
    ],
    { duration: 2650, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" },
  );

  grid.animate(
    [
      { opacity: 0.22, transform: "scale(1)" },
      { opacity: 0, transform: "scale(1.12)" },
    ],
    { duration: 2100, delay: 500, easing: "ease-out", fill: "forwards" },
  );

  wordmark.animate(
    [
      { opacity: 0, transform: "translate(-50%, -50%) translateY(22px)" },
      { opacity: 1, transform: "translate(-50%, -50%) translateY(0)", offset: 0.22 },
      { opacity: 1, transform: "translate(-50%, -50%) translateY(0)", offset: 0.54 },
      { opacity: 0, transform: "translate(-50%, -50%) translateY(-18px)" },
    ],
    { duration: 1650, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" },
  );

  const ballAnimation = ball.animate(
    [
      {
        transform: "translate(-50%, -50%) scale(1.38) rotate(-12deg)",
        offset: 0,
      },
      {
        transform: "translate(-50%, -50%) scale(1.38) rotate(-12deg)",
        offset: 0.18,
      },
      {
        transform: "translate(-50%, -50%) scale(.76) rotate(54deg)",
        offset: 0.44,
      },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY - 42}px)) scale(${destinationScale * 0.9}) rotate(300deg)`,
        offset: 0.76,
      },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY + 7}px)) scale(${destinationScale * 1.05}) rotate(336deg)`,
        offset: 0.88,
      },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY - 14}px)) scale(${destinationScale * 0.96}) rotate(350deg)`,
        offset: 0.95,
      },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY}px)) scale(${destinationScale}) rotate(360deg)`,
        offset: 1,
      },
    ],
    { duration: 2700, easing: "cubic-bezier(.62,.05,.2,1)", fill: "forwards" },
  );

  await ballAnimation.finished;
  await backdropAnimation.finished;
  finishIntro();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  requestPrediction();
});

homeSelect.addEventListener("change", syncCrests);
awaySelect.addEventListener("change", syncCrests);

swapButton.addEventListener("click", () => {
  const homeTeam = homeSelect.value;
  homeSelect.value = awaySelect.value;
  awaySelect.value = homeTeam;
  syncCrests();
  clearError();
});

initialize();
playIntro();
