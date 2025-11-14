/* 
  app.js
  - Keeps logic simple and readable
  - Sends short confirmations to a live region for screen readers
  - Includes optional voice commands if the browser supports them
*/

// Helper: announce short messages (visual + screen reader)
const live = document.getElementById('live');
function say(msg) {
  live.textContent = msg;
  // Optional: speech synthesis if available (auditory feedback)
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utterance);
  }
}

/* ------------------ Accessibility Toggles ------------------ */

const contrastBtn = document.getElementById('toggleContrastBtn');
const textSizeBtn = document.getElementById('toggleTextSizeBtn');

contrastBtn.addEventListener('click', () => {
  // For this simple demo, we keep high contrast always on visually,
  // but we show how you'd toggle and update aria-pressed + label.
  const on = contrastBtn.getAttribute('aria-pressed') === 'true';
  contrastBtn.setAttribute('aria-pressed', String(!on));
  contrastBtn.textContent = `High Contrast: ${on ? 'Off' : 'On'}`;
  say(`High contrast ${on ? 'off' : 'on'}`);
});

textSizeBtn.addEventListener('click', () => {
  const on = textSizeBtn.getAttribute('aria-pressed') === 'true';
  textSizeBtn.setAttribute('aria-pressed', String(!on));
  textSizeBtn.textContent = `Large Text: ${on ? 'Off' : 'On'}`;
  document.body.classList.toggle('text-lg', !on);
  say(`Large text ${on ? 'off' : 'on'}`);
});

/* ------------------ HELP (Emergency) ------------------ */

document.getElementById('helpBtn').addEventListener('click', () => {
  // In a real app this would call a caregiver or 911.
  // Here we just confirm clearly.
  say('Emergency alert sent to your contacts.');
  alert('Emergency: Caregivers have been notified (demo).');
});

/* ------------------ Lights ------------------ */

const lightToggle = document.getElementById('lightToggle');
const lightState = document.getElementById('lightState');
const brightness = document.getElementById('brightness');

let lightsOn = false;

function updateLightUI() {
  lightToggle.textContent = lightsOn ? 'Turn Off' : 'Turn On';
  lightToggle.setAttribute('aria-pressed', String(lightsOn));
  lightState.textContent = lightsOn ? 'On' : 'Off';
}

lightToggle.addEventListener('click', () => {
  lightsOn = !lightsOn;
  updateLightUI();
  say(`Lights turned ${lightsOn ? 'on' : 'off'}.`);
});

brightness.addEventListener('input', (e) => {
  const value = e.target.value;
  // If lights are off, gently remind the user we’re adjusting the next "on" level
  say(`Brightness set to ${value} percent.`);
});

/* ------------------ Temperature ------------------ */

const tempValueEl = document.getElementById('tempValue');
const tempDown = document.getElementById('tempDown');
const tempUp = document.getElementById('tempUp');
const autoMode = document.getElementById('autoMode');

let temp = 21;            // start at 21°C
let isAuto = false;

function updateTempUI() {
  tempValueEl.textContent = String(temp);
  autoMode.textContent = `Auto: ${isAuto ? 'On' : 'Off'}`;
  autoMode.setAttribute('aria-pressed', String(isAuto));
}

tempDown.addEventListener('click', () => {
  temp -= 1;
  updateTempUI();
  say(`Temperature set to ${temp} degrees.`);
});

tempUp.addEventListener('click', () => {
  temp += 1;
  updateTempUI();
  say(`Temperature set to ${temp} degrees.`);
});

autoMode.addEventListener('click', () => {
  isAuto = !isAuto;
  updateTempUI();
  say(`Auto mode ${isAuto ? 'enabled' : 'disabled'}.`);
});

/* ------------------ Energy ------------------ */

const energyToday = document.getElementById('energyToday');
const energyWeek = document.getElementById('energyWeek');
const energyFeedback = document.getElementById('energyFeedback');
const refreshEnergy = document.getElementById('refreshEnergy');

// Simple mock function to vary numbers a bit
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

refreshEnergy.addEventListener('click', () => {
  const today = randomBetween(35, 55);
  const week = randomBetween(280, 340);
  energyToday.textContent = `${today} kWh`;
  energyWeek.textContent = `${week} kWh`;

  // Plain-language feedback (positive reinforcement)
  const saved = randomBetween(5, 15);
  energyFeedback.textContent = `You saved ${saved}% this week. Keep it up!`;
  say('Energy usage updated.');
});

/* ------------------ Security ------------------ */

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
  say(`Door ${isLocked ? 'locked' : 'unlocked'}.`);
});

/* ------------------ Optional Voice Control ------------------ */
/* 
  Supports basic phrases:
   - "turn lights on/off"
   - "set temperature to 22"
   - "lock/unlock door"
   - "help"
*/
const voiceBtn = document.getElementById('voiceBtn');

function handleCommand(text) {
  const cmd = text.toLowerCase();

  // Lights
  if (cmd.includes('lights on') || cmd.includes('turn lights on')) {
    lightsOn = true; updateLightUI(); say('Lights turned on.');
    return;
  }
  if (cmd.includes('lights off') || cmd.includes('turn lights off')) {
    lightsOn = false; updateLightUI(); say('Lights turned off.');
    return;
  }

  // Temperature (e.g., "set temperature to 22")
  const tempMatch = cmd.match(/set (the )?temperature to (\d{1,2})/);
  if (tempMatch) {
    temp = parseInt(tempMatch[2], 10);
    updateTempUI();
    say(`Temperature set to ${temp} degrees.`);
    return;
  }

  // Security
  if (cmd.includes('lock')) {
    isLocked = true; updateLockUI(); say('Door locked.');
    return;
  }
  if (cmd.includes('unlock')) {
    isLocked = false; updateLockUI(); say('Door unlocked.');
    return;
  }

  // Help
  if (cmd.includes('help') || cmd.includes('emergency')) {
    document.getElementById('helpBtn').click();
    return;
  }

  // Fallback
  say('Sorry, I did not understand that command.');
}

// Feature-detect webkitSpeechRecognition (widely available in Chromium)
let recognition;
if ('webkitSpeechRecognition' in window) {
  const WebSpeechRecognition = window.webkitSpeechRecognition;
  recognition = new WebSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    handleCommand(transcript);
  });

  recognition.addEventListener('error', () => {
    say('Voice error. Please try again.');
  });

  recognition.addEventListener('end', () => {
    // End automatically after one phrase; user can tap again.
    voiceBtn.disabled = false;
    voiceBtn.textContent = '🎤 Voice';
  });

  voiceBtn.addEventListener('click', () => {
    voiceBtn.disabled = true;
    voiceBtn.textContent = 'Listening…';
    say('Listening.');
    recognition.start();
  });
} else {
  // If not supported, provide a graceful fallback
  voiceBtn.addEventListener('click', () => {
    const text = prompt('Voice not supported. Type a command (e.g., "Turn lights on", "Set temperature to 22", "Lock door", "Help"):');
    if (text) handleCommand(text);
  });
}
