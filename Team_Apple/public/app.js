/*< COMP 3450: <Mehak,Ujwal,Harshit> ------------------------------------------------------------
  SIMPLE SMART HOME DASHBOARD + FIREBASE REST API
-------------------------------------------------------------*/

/************************************************************
  FIREBASE SETTINGS
*************************************************************/
const DB_URL = "https://hci-smart-home-default-rtdb.firebaseio.com/";
const SECRET = "usWNzGu3q9TKUTpUh8mNmyj0iCO2801cPTmpFF4H";

/************************************************************
  FIREBASE WRITE FUNCTIONS
*************************************************************/
async function sendLightToFirebase(state) {
  const url = `${DB_URL}light.json?auth=${SECRET}`;
  try {
    await fetch(url, { method: "PUT", body: JSON.stringify(state) });
  } catch (err) {
    console.error("Firebase Light Error:", err);
  }
}

async function sendBrightnessToFirebase(value) {
  const url = `${DB_URL}brightness.json?auth=${SECRET}`;
  try {
    await fetch(url, { method: "PUT", body: JSON.stringify(value) });
  } catch (err) {
    console.error("Firebase Brightness Error:", err);
  }
}

/************************************************************
  LIVE ANNOUNCER + VOICE FEEDBACK
*************************************************************/
const live = document.getElementById("live");
function say(msg) {
  live.textContent = msg;

  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utter);
  }
}

/************************************************************
  ACCESSIBILITY TOGGLES (TAILWIND ONLY)
*************************************************************/
const contrastBtn = document.getElementById("toggleContrastBtn");
const textSizeBtn = document.getElementById("toggleTextSizeBtn");

const bodyRoot = document.getElementById("bodyRoot") || document.body;
const headerRoot = document.getElementById("headerRoot");
const footerRoot = document.getElementById("footerRoot");

// groups for resizing + contrast
const cards = [...document.querySelectorAll(".card")];
const titles = [...document.querySelectorAll(".card-title")];
const buttons = [...document.querySelectorAll("button")];
const hints = [...document.querySelectorAll(".hint-base")];
const labels = [...document.querySelectorAll(".label-base")];
const tempsVal = document.getElementById("tempValue");
const tempsUnit = document.getElementById("tempUnit");
const statsVal = [...document.querySelectorAll(".stat-value-base")];
const statsLab = [...document.querySelectorAll(".stat-label-base")];
const statusText = [...document.querySelectorAll(".status-base")];
const humidityText = [...document.querySelectorAll(".humidity-base")];
const feedbackText = document.getElementById("energyFeedback");
const helpBtn = document.getElementById("helpBtn");

// ---------- LARGE TEXT MODE ----------
function setLargeText(on) {
  // base body text
  bodyRoot.classList.toggle("text-xl", on);

  // app title
  const appTitle = document.getElementById("appTitle");
  if (appTitle) {
    appTitle.classList.toggle("text-5xl", on);
    appTitle.classList.toggle("text-3xl", !on);
  }

  // card titles
  titles.forEach(t => {
    t.classList.toggle("text-3xl", on);
    t.classList.toggle("text-2xl", !on);
  });

  // buttons bigger
  buttons.forEach(b => {
    b.classList.toggle("text-2xl", on);
    b.classList.toggle("text-base", !on);
    b.classList.toggle("py-4", on);
    b.classList.toggle("py-3", !on);
    b.classList.toggle("px-6", on);
    b.classList.toggle("px-4", !on);
  });

  // labels / hints
  labels.forEach(l => l.classList.toggle("text-2xl", on));
  hints.forEach(h => h.classList.toggle("text-lg", on));

  // temperature text
  if (tempsVal) {
    tempsVal.classList.toggle("text-6xl", on);
    tempsVal.classList.toggle("text-5xl", !on);
  }
  if (tempsUnit) {
    tempsUnit.classList.toggle("text-4xl", on);
    tempsUnit.classList.toggle("text-3xl", !on);
  }

  // stats + status + humidity
  statsVal.forEach(v => v.classList.toggle("text-2xl", on));
  statsLab.forEach(v => v.classList.toggle("text-lg", on));
  statusText.forEach(s => s.classList.toggle("text-2xl", on));
  humidityText.forEach(h => h.classList.toggle("text-2xl", on));
  if (feedbackText) feedbackText.classList.toggle("text-2xl", on);
}

textSizeBtn.addEventListener("click", () => {
  const on = textSizeBtn.getAttribute("aria-pressed") === "true";
  setLargeText(!on);
  textSizeBtn.setAttribute("aria-pressed", String(!on));
  textSizeBtn.textContent = `Large Text: ${on ? "Off" : "On"}`;
  say(`Large text ${on ? "off" : "on"}`);
});

// ---------- HIGH CONTRAST MODE ----------
function setContrast(on) {
  // body flip
  bodyRoot.classList.toggle("bg-black", on);
  bodyRoot.classList.toggle("text-white", on);
  bodyRoot.classList.toggle("bg-slate-50", !on);
  bodyRoot.classList.toggle("text-slate-900", !on);

  // header
  if (headerRoot) {
    headerRoot.classList.toggle("bg-black", on);
    headerRoot.classList.toggle("border-white", on);
    headerRoot.classList.toggle("text-white", on);

    headerRoot.classList.toggle("bg-white", !on);
    headerRoot.classList.toggle("border-slate-200", !on);
    headerRoot.classList.toggle("text-slate-900", !on);
  }

  // footer
  if (footerRoot) {
    footerRoot.classList.toggle("text-white", on);
    footerRoot.classList.toggle("text-slate-500", !on);
  }

  // cards
  cards.forEach(c => {
    c.classList.toggle("bg-black", on);
    c.classList.toggle("text-white", on);
    c.classList.toggle("border-white", on);

    c.classList.toggle("bg-white", !on);
    c.classList.toggle("text-slate-900", !on);
    c.classList.toggle("border-slate-900", !on);
  });

  // secondary buttons
  document.querySelectorAll(".btn-secondary").forEach(b => {
    b.classList.toggle("bg-black", on);
    b.classList.toggle("text-white", on);
    b.classList.toggle("border-white", on);

    b.classList.toggle("bg-slate-100", !on);
    b.classList.toggle("text-slate-900", !on);
    b.classList.toggle("border-slate-300", !on);
  });

  // primary buttons – add bright outline
  document.querySelectorAll(".btn-primary").forEach(b => {
    b.classList.toggle("ring-4", on);
    b.classList.toggle("ring-white", on);
  });

  // help button yellow in contrast
  if (helpBtn) {
    helpBtn.classList.toggle("bg-yellow-300", on);
    helpBtn.classList.toggle("text-black", on);
    helpBtn.classList.toggle("bg-rose-600", !on);
    helpBtn.classList.toggle("text-white", !on);
  }

  // stat boxes flip
  document.querySelectorAll(".stat-box").forEach(s => {
    s.classList.toggle("bg-black", on);
    s.classList.toggle("border-white", on);
    s.classList.toggle("bg-slate-50", !on);
    s.classList.toggle("border-slate-200", !on);
  });

  // hints
  hints.forEach(h => {
    h.classList.toggle("text-slate-300", on);
    h.classList.toggle("text-slate-600", !on);
  });
}

contrastBtn.addEventListener("click", () => {
  const on = contrastBtn.getAttribute("aria-pressed") === "true";
  setContrast(!on);
  contrastBtn.setAttribute("aria-pressed", String(!on));
  contrastBtn.textContent = `High Contrast: ${on ? "Off" : "On"}`;
  say(`High contrast ${on ? "off" : "on"}`);
});

/************************************************************
  HELP BUTTON
*************************************************************/
document.getElementById("helpBtn").addEventListener("click", () => {
  say("Emergency alert sent to your contacts.");
  alert("Emergency: Caregivers have been notified (demo).");
});

/************************************************************
  LIGHTS MODULE
*************************************************************/
const lightToggle = document.getElementById("lightToggle");
const lightStateLabel = document.getElementById("lightState");
const brightness = document.getElementById("brightness");

let lightsOn = false;

function updateLightUI() {
  lightToggle.textContent = lightsOn ? "Turn Off" : "Turn On";
  lightToggle.setAttribute("aria-pressed", String(lightsOn));
  lightStateLabel.textContent = lightsOn ? "On" : "Off";
}

lightToggle.addEventListener("click", () => {
  lightsOn = !lightsOn;
  updateLightUI();
  say(`Lights turned ${lightsOn ? "on" : "off"}.`);
  sendLightToFirebase(lightsOn ? "ON" : "OFF");
});

let brightnessAnnounceCount = 0;

brightness.addEventListener("change", (e) => {
  const value = Number(e.target.value);

  if (brightnessAnnounceCount < 2) {
    say(`Brightness set to ${value} percent.`);
    brightnessAnnounceCount++;
  }

  sendBrightnessToFirebase(value);
});

brightness.addEventListener("input", (e) => {
  const value = Number(e.target.value);
  sendBrightnessToFirebase(value);
});

/************************************************************
  TEMPERATURE + HUMIDITY MODULE
*************************************************************/
const tempValue = document.getElementById("tempValue");
const unitToggle = document.getElementById("unitToggle");
const humidityValue = document.getElementById("humidityValue");

let currentTempC = 0;
let showF = false;

const cToF = (c) => (c * 9) / 5 + 32;

function updateTempUI() {
  tempValue.textContent = showF
    ? cToF(currentTempC).toFixed(1)
    : currentTempC.toFixed(1);
}

unitToggle.addEventListener("click", () => {
  showF = !showF;
  unitToggle.textContent = showF ? "Show °C" : "Show °F";
  say(`Showing temperature in ${showF ? "Fahrenheit" : "Celsius"}`);
  updateTempUI();
});

async function fetchTemperature() {
  try {
    const res = await fetch(`${DB_URL}temperature_c.json?auth=${SECRET}`);
    const value = await res.json();

    if (typeof value === "number") {
      currentTempC = value;
      updateTempUI();
    }
  } catch (err) {
    console.error("Temp Fetch Error:", err);
  }
}

async function fetchHumidity() {
  try {
    const res = await fetch(`${DB_URL}humidity.json?auth=${SECRET}`);
    const value = await res.json();

    if (typeof value === "number") {
      humidityValue.textContent = value;
    }
  } catch (err) {
    console.error("Humidity Fetch Error:", err);
  }
}

setInterval(fetchTemperature, 2000);
setInterval(fetchHumidity, 2000);

/************************************************************
  ENERGY MODULE (Demo)
*************************************************************/
const energyToday = document.getElementById("energyToday");
const energyWeek = document.getElementById("energyWeek");
const energyFeedback = document.getElementById("energyFeedback");
const refreshEnergy = document.getElementById("refreshEnergy");

refreshEnergy.addEventListener("click", () => {
  const today = Math.floor(Math.random() * (55 - 35) + 35);
  const week = Math.floor(Math.random() * (340 - 280) + 280);
  const saved = Math.floor(Math.random() * (15 - 5) + 5);

  energyToday.textContent = `${today} kWh`;
  energyWeek.textContent = `${week} kWh`;
  energyFeedback.textContent = `You saved ${saved}% this week. Keep it up!`;

  say("Energy usage updated.");
});

/************************************************************
  PROXIMITY SENSOR (TAILWIND ALERT TOGGLE)
*************************************************************/
const proximityStatus = document.getElementById("proximityStatus");
const distanceValue = document.getElementById("distanceValue");
const proximityAlert = document.getElementById("proximityAlert");

let lastState = "CLEAR";
let movementAnnouncedCount = 0;
let clearAnnouncedCount = 0;

async function fetchProximity() {
  try {
    const distRes = await fetch(`${DB_URL}security/distance.json?auth=${SECRET}`);
    const statusRes = await fetch(`${DB_URL}security/status.json?auth=${SECRET}`);

    const distance = await distRes.json();
    const status = await statusRes.json();

    if (typeof distance === "number") {
      distanceValue.textContent = distance + " cm";
    }

    if (status) {
      proximityStatus.textContent = status;

      if (status === "WARNING") {
        proximityStatus.classList.remove("text-green-500");
        proximityStatus.classList.add("text-red-500");

        proximityAlert.classList.remove("hidden");
        proximityAlert.classList.add("block");

        if (lastState !== "WARNING" && movementAnnouncedCount === 0) {
          movementAnnouncedCount++;
          clearAnnouncedCount = 0;
          say("Movement detected.");
        }
      } else {
        proximityStatus.classList.remove("text-red-500");
        proximityStatus.classList.add("text-green-500");

        proximityAlert.classList.add("hidden");
        proximityAlert.classList.remove("block");

        if (lastState !== "CLEAR" && clearAnnouncedCount === 0) {
          clearAnnouncedCount++;
          movementAnnouncedCount = 0;
          say("Area is now clear.");
        }
      }

      lastState = status;
    }
  } catch (err) {
    console.error("Proximity Fetch Error:", err);
  }
}

setInterval(fetchProximity, 1500);

/************************************************************
  VOICE CONTROL
*************************************************************/
const voiceBtn = document.getElementById("voiceBtn");
let recognition;

function handleCommand(text) {
  const cmd = text.toLowerCase();

  if (cmd.includes("lights on")) {
    lightsOn = true;
    updateLightUI();
    sendLightToFirebase("ON");
    say("Lights on.");
    return;
  }

  if (cmd.includes("lights off")) {
    lightsOn = false;
    updateLightUI();
    sendLightToFirebase("OFF");
    say("Lights off.");
    return;
  }

  if (cmd.includes("help")) {
    document.getElementById("helpBtn").click();
    return;
  }

  say("Sorry, I didn't understand that.");
}

if ("webkitSpeechRecognition" in window) {
  const R = window.webkitSpeechRecognition;
  recognition = new R();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.addEventListener("result", (e) => {
    const transcript = e.results[0][0].transcript;
    handleCommand(transcript);
  });

  recognition.addEventListener("end", () => {
    voiceBtn.disabled = false;
    voiceBtn.textContent = "🎤 Voice";
  });

  voiceBtn.addEventListener("click", () => {
    voiceBtn.disabled = true;
    voiceBtn.textContent = "Listening…";
    say("Listening");
    recognition.start();
  });
} else {
  voiceBtn.addEventListener("click", () => {
    const text = prompt("Type a command:");
    if (text) handleCommand(text);
  });
}

console.log("Smart Home Dashboard Ready.");
