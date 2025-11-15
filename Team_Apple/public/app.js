/* ------------------------------------------------------------
  SIMPLE SMART HOME DASHBOARD + FIREBASE REST API
  - Uses ONLY Database URL + Secret Key
  - No Firebase SDK, No tokens
-------------------------------------------------------------*/

/************************************************************
  FIREBASE SETTINGS (REST API)
*************************************************************/
const DB_URL = "https://hci-smart-home-default-rtdb.firebaseio.com/";
const SECRET = "usWNzGu3q9TKUTpUh8mNmyj0iCO2801cPTmpFF4H";

// Send Light State to Firebase
async function sendLightToFirebase(state) {
  const url = ${DB_URL}light.json?auth=${SECRET};

  try {
    await fetch(url, {
      method: "PUT",
      body: JSON.stringify(state)
    });
    console.log("🔥 Firebase light set to:", state);
  } catch (err) {
    console.error("❌ Firebase write error:", err);
  }
}

/************************************************************
  LIVE ANNOUNCER (ACCESSIBILITY)
*************************************************************/
const live = document.getElementById('live');
function say(msg) {
  live.textContent = msg;

  // Optional speech synthesis
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utter);
  }
}

/************************************************************
  ACCESSIBILITY TOGGLES
*************************************************************/
const contrastBtn = document.getElementById('toggleContrastBtn');
const textSizeBtn = document.getElementById('toggleTextSizeBtn');

contrastBtn.addEventListener('click', () => {
  const on = contrastBtn.getAttribute('aria-pressed') === 'true';
  contrastBtn.setAttribute('aria-pressed', String(!on));
  contrastBtn.textContent = High Contrast: ${on ? 'Off' : 'On'};
  say(High contrast ${on ? 'off' : 'on'});
});

textSizeBtn.addEventListener('click', () => {
  const on = textSizeBtn.getAttribute('aria-pressed') === 'true';
  textSizeBtn.setAttribute('aria-pressed', String(!on));
  textSizeBtn.textContent = Large Text: ${on ? 'Off' : 'On'};
  document.body.classList.toggle('text-lg', !on);
  say(Large text ${on ? 'off' : 'on'});
});

/************************************************************
  HELP / EMERGENCY BUTTON
*************************************************************/
document.getElementById('helpBtn').addEventListener('click', () => {
  say('Emergency alert sent to your contacts.');
  alert('Emergency: Caregivers have been notified (demo).');
});

/************************************************************
  LIGHTS MODULE (🔥 Connected to Firebase)
*************************************************************/
const lightToggle = document.getElementById('lightToggle');
const lightStateLabel = document.getElementById('lightState');
const brightness = document.getElementById('brightness');

let lightsOn = false;

// Update UI
function updateLightUI() {
  lightToggle.textContent = lightsOn ? 'Turn Off' : 'Turn On';
  lightToggle.setAttribute('aria-pressed', String(lightsOn));
  lightStateLabel.textContent = lightsOn ? 'On' : 'Off';
}

// On Light Toggle
lightToggle.addEventListener('click', () => {
  lightsOn = !lightsOn;
  updateLightUI();
  say(Lights turned ${lightsOn ? 'on' : 'off'}.);

  // 🔥 SEND TO FIREBASE
  const fbValue = lightsOn ? "ON" : "OFF";
  sendLightToFirebase(fbValue);
});

// Brightness slider local UI only
brightness.addEventListener('input', (e) => {
  const value = e.target.value;
  say(Brightness set to ${value} percent.);
});

/************************************************************
  TEMPERATURE MODULE
*************************************************************/
const tempValueEl = document.getElementById('tempValue');
const tempDown = document.getElementById('tempDown');
const tempUp = document.getElementById('tempUp');
const autoMode = document.getElementById('autoMode');

let temp = 21;
let isAuto = false;

function updateTempUI() {
  tempValueEl.textContent = String(temp);
  autoMode.textContent = Auto: ${isAuto ? 'On' : 'Off'};
  autoMode.setAttribute('aria-pressed', String(isAuto));
}

tempDown.addEventListener('click', () => {
  temp -= 1;
  updateTempUI();
  say(Temperature set to ${temp} degrees.);
});

tempUp.addEventListener('click', () => {
  temp += 1;
  updateTempUI();
  say(Temperature set to ${temp} degrees.);
});

autoMode.addEventListener('click', () => {
  isAuto = !isAuto;
  updateTempUI();
  say(Auto mode ${isAuto ? 'enabled' : 'disabled'}.);
});

/************************************************************
  ENERGY MODULE
*************************************************************/
const energyToday = document.getElementById('energyToday');
const energyWeek = document.getElementById('energyWeek');
const energyFeedback = document.getElementById('energyFeedback');
const refreshEnergy = document.getElementById('refreshEnergy');

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

refreshEnergy.addEventListener('click', () => {
  const today = randomBetween(35, 55);
  const week = randomBetween(280, 340);
  energyToday.textContent = ${today} kWh;
  energyWeek.textContent = ${week} kWh;

  const saved = randomBetween(5, 15);
  energyFeedback.textContent = You saved ${saved}% this week. Keep it up!;
  say('Energy usage updated.');
});

/************************************************************
  SECURITY / DOOR LOCK MODULE
*************************************************************/
const lockToggle = document.getElementById('lockToggle');
const lockState = document.getElementById('lockState');

let isLocked = true;

function updateLockUI() {
  lockToggle.textContent = isLocked ? 'Unlock' : 'Lock';
  lockToggle.setAttribute('aria-pressed', String(isLocked));
  lockState.textContent = isLocked ? 'Locked' : 'Unlocked';
}

lockToggle.addEventListener('click', () => {
  isLocked = !isLocked;
  updateLockUI();
  say(Door ${isLocked ? 'locked' : 'unlocked'}.);
});

/************************************************************
  OPTIONAL VOICE CONTROL
*************************************************************/
const voiceBtn = document.getElementById('voiceBtn');

function handleCommand(text) {
  const cmd = text.toLowerCase();

  // LIGHTS
  if (cmd.includes('lights on')) { lightsOn = true; updateLightUI(); sendLightToFirebase("ON"); say('Lights on.'); return; }
  if (cmd.includes('lights off')) { lightsOn = false; updateLightUI(); sendLightToFirebase("OFF"); say('Lights off.'); return; }

  // TEMPERATURE
  const match = cmd.match(/set temperature to (\d{1,2})/);
  if (match) { temp = parseInt(match[1]); updateTempUI(); say(Temperature set to ${temp}); return; }

  // LOCK / UNLOCK
  if (cmd.includes('unlock')) { isLocked = false; updateLockUI(); say('Door unlocked.'); return; }
  if (cmd.includes('lock')) { isLocked = true; updateLockUI(); say('Door locked.'); return; }

  // HELP
  if (cmd.includes('help') || cmd.includes('emergency')) {
    document.getElementById('helpBtn').click();
    return;
  }

  say('Sorry, I did not understand that.');
}

let recognition;
if ('webkitSpeechRecognition' in window) {
  const R = window.webkitSpeechRecognition;
  recognition = new R();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.addEventListener('result', e => {
    const transcript = e.results[0][0].transcript;
    handleCommand(transcript);
  });

  recognition.addEventListener('end', () => {
    voiceBtn.disabled = false;
    voiceBtn.textContent = '🎤 Voice';
  });

  voiceBtn.addEventListener('click', () => {
    voiceBtn.disabled = true;
    voiceBtn.textContent = 'Listening…';
    say('Listening');
    recognition.start();
  });

} else {
  voiceBtn.addEventListener('click', () => {
    const text = prompt("Type command (Lights on, 22 degrees, Unlock door):");
    if (text) handleCommand(text);
  });
}

console.log("Smart Home Dashboard Ready.");