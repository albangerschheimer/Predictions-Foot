const homeSelect = document.querySelector("#home-team");
const awaySelect = document.querySelector("#away-team");
const swapButton = document.querySelector("#swap-teams");
const matchCard = document.querySelector("#match-card");
const results = document.querySelector("#results");
const errorMessage = document.querySelector("#form-error");

let latestRequest = 0;

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

function paintCrest(container, team) {
  const image = container.querySelector("img");
  const fallback = container.querySelector(".crest-fallback");
  const asset = teamAssets[team];

  fallback.textContent = initials(team);
  container.classList.remove("is-fallback");

  if (!asset) {
    image.removeAttribute("src");
    image.alt = "";
    container.classList.add("is-fallback");
    return;
  }

  image.onload = () => container.classList.remove("is-fallback");
  image.onerror = () => container.classList.add("is-fallback");
  image.src = `/assets/teams/${asset}.png`;
  image.alt = `${team} crest`;
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
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function formatProbability(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function renderRecentForm(container, matches) {
  container.replaceChildren(
    ...matches.map((match) => {
      const item = document.createElement("li");
      item.className = `result-${match.result.toLowerCase()}`;
      item.title = `${match.venue === "home" ? "vs" : "at"} ${match.opponent}`;

      const result = document.createElement("span");
      result.className = "result-badge";
      result.textContent = match.result;

      const opponent = document.createElement("span");
      opponent.className = "opponent";
      opponent.textContent = `${match.venue === "away" ? "@ " : ""}${match.opponent}`;

      const score = document.createElement("strong");
      score.textContent = `${match.goals_for}–${match.goals_against}`;

      item.append(result, opponent, score);
      return item;
    }),
  );
}

function renderPrediction(data) {
  const { home_team: homeTeam, away_team: awayTeam, prediction, probabilities, recent_form: recentForm } = data;
  const winnerKey = { H: "home", D: "draw", A: "away" }[prediction.class];

  paintCrest(document.querySelector("#home-crest"), homeTeam);
  paintCrest(document.querySelector("#away-crest"), awayTeam);
  renderRecentForm(document.querySelector("#home-form"), recentForm.home);
  renderRecentForm(document.querySelector("#away-form"), recentForm.away);

  document.querySelector("#prediction-title").textContent = prediction.label;
  document.querySelector("#home-result-label").textContent = homeTeam;
  document.querySelector("#away-result-label").textContent = awayTeam;

  for (const outcome of ["home", "draw", "away"]) {
    document.querySelector(`#${outcome}-probability`).textContent = formatProbability(probabilities[outcome]);
    document.querySelector(`#${outcome}-bar`).style.width = `${probabilities[outcome] * 100}%`;
    document.querySelector(`[data-outcome="${outcome}"]`).classList.toggle(
      "is-winner",
      outcome === winnerKey,
    );
  }

  results.hidden = false;
}

async function updateFixture() {
  clearError();
  paintCrest(document.querySelector("#home-crest"), homeSelect.value);
  paintCrest(document.querySelector("#away-crest"), awaySelect.value);

  if (homeSelect.value === awaySelect.value) {
    document.querySelector("#home-form").replaceChildren();
    document.querySelector("#away-form").replaceChildren();
    results.hidden = true;
    showError("Choose two different teams.");
    return;
  }

  const requestId = ++latestRequest;
  matchCard.classList.add("is-loading");
  matchCard.setAttribute("aria-busy", "true");

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
      throw new Error(data.detail || "Unable to calculate this fixture.");
    }
    if (requestId !== latestRequest) return;

    renderPrediction(data);
  } catch (error) {
    if (requestId === latestRequest) {
      showError(error.message || "The prediction service is unavailable.");
    }
  } finally {
    if (requestId === latestRequest) {
      matchCard.classList.remove("is-loading");
      matchCard.removeAttribute("aria-busy");
    }
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
    await updateFixture();
  } catch {
    showError("Unable to load the teams.");
  }
}

function finishIntro() {
  document.documentElement.classList.remove("intro-pending");
  document.querySelector("#intro").hidden = true;
}

async function playIntro() {
  const intro = document.querySelector("#intro");
  const ball = document.querySelector("#intro-ball");
  const target = document.querySelector("#header-ball");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || sessionStorage.getItem("prediction-foot-intro")) {
    finishIntro();
    return;
  }

  sessionStorage.setItem("prediction-foot-intro", "seen");

  try {
    await ball.decode();
  } catch {
    finishIntro();
    return;
  }

  const targetBox = target.getBoundingClientRect();
  const destinationX = targetBox.left + targetBox.width / 2 - window.innerWidth / 2;
  const destinationY = targetBox.top + targetBox.height / 2 - window.innerHeight / 2;
  const destinationScale = targetBox.width / ball.offsetWidth;

  const animation = ball.animate(
    [
      { transform: "translate(-50%, -50%) scale(1.15) rotate(-8deg)", offset: 0 },
      { transform: "translate(-50%, -50%) scale(1.15) rotate(-8deg)", offset: 0.28 },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY - 18}px)) scale(${destinationScale}) rotate(320deg)`,
        offset: 0.82,
      },
      {
        transform: `translate(calc(-50% + ${destinationX}px), calc(-50% + ${destinationY}px)) scale(${destinationScale}) rotate(360deg)`,
        offset: 1,
      },
    ],
    { duration: 1500, easing: "cubic-bezier(.6,.05,.25,1)", fill: "forwards" },
  );

  intro.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], {
    duration: 1500,
    easing: "ease-in",
    fill: "forwards",
  });

  await animation.finished;
  finishIntro();
}

homeSelect.addEventListener("change", updateFixture);
awaySelect.addEventListener("change", updateFixture);
swapButton.addEventListener("click", () => {
  const homeTeam = homeSelect.value;
  homeSelect.value = awaySelect.value;
  awaySelect.value = homeTeam;
  updateFixture();
});

initialize();
playIntro();
