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
    speechSynthesis.cancel(); // Cancel any pending speech
    const utter = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utter);
  }
}

/************************************************************
  ACCESSIBILITY TOGGLES
*************************************************************/
const contrastBtn = document.getElementById("toggleContrastBtn");
const textSizeBtn = document.getElementById("toggleTextSizeBtn");

contrastBtn.addEventListener("click", () => {
  const on = contrastBtn.getAttribute("aria-pressed") === "true";
  contrastBtn.setAttribute("aria-pressed", String(!on));
  contrastBtn.textContent = `High Contrast: ${on ? "Off" : "On"}`;
  say(`High contrast ${on ? "off" : "on"}`);
});

textSizeBtn.addEventListener("click", () => {
  const on = textSizeBtn.getAttribute("aria-pressed") === "true";
  textSizeBtn.setAttribute("aria-pressed", String(!on));
  textSizeBtn.textContent = `Large Text: ${on ? "Off" : "On"}`;
  document.body.classList.toggle("text-lg", !on);
  say(`Large text ${on ? "off" : "on"}`);
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
  PROXIMITY SENSOR (🔥 FIXED + RED ALERT)
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
        proximityStatus.style.color = "red";
        proximityAlert.style.display = "block";

        if (lastState !== "WARNING" && movementAnnouncedCount === 0) {
          movementAnnouncedCount++;
          clearAnnouncedCount = 0; // Reset clear counter
          say("Movement detected.");
        }
      } else {
        proximityStatus.style.color = "green";
        proximityAlert.style.display = "none";

        if (lastState !== "CLEAR" && clearAnnouncedCount === 0) {
          clearAnnouncedCount++;
          movementAnnouncedCount = 0; // Reset movement counter
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
