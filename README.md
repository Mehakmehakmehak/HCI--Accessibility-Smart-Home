## COMP 3450: <Mehak,Ujwal,Harshit>
Accessibility Smart Home
An accessibility-first smart home prototype that synchronizes a web dashboard with Arduino-based sensors/actuators using Firebase Realtime Database.

## Documentation

### Manual

#### A. Installation instructions

1. **Environment setup**  
   - Install the Arduino IDE (tested with 2.3.6 on Windows via `https://downloads.arduino.cc/arduino-ide/arduino-ide_2.3.6_Windows_64bit.exe`).  
   - Add required libraries through Library Manager: `WiFiS3`, `ArduinoHttpClient`, and `DHT sensor library`.  
   - Create a Firebase Realtime Database, enable test mode, and note the database secret for REST calls.  
   - Prepare a 2.4 GHz Wi-Fi or mobile hotspot; campus Wi-Fi often blocks IoT devices, so plan to use a personal network.

2. **Hardware + source installation**  
   - Components: Arduino UNO R4 WiFi (or compatible Wi-Fi board), solderless breadboard, jumper wires, DHT11 sensor (signal → D2), HC-SR04 ultrasonic sensor (Trig → D6, Echo → D5), LED or relay on PWM pin D9.  
   - Open `Team_Apple/public/Smart_Home.ino`, update `ssid`, `pass`, `FIREBASE_HOST`, and `FIREBASE_SECRET`, then upload the sketch.  
   - Keep the USB cable connected for power and optional serial monitoring.

3. **Web dashboard setup**  
   - Copy all files under `Team_Apple/public/`.  
   - Update `DB_URL` and `SECRET` inside `app.js` to the same Firebase values.  
   - Option A: double-click `index.html` for a quick local run.  
   - Option B (recommended for voice input): serve the folder over HTTPS/localhost (`cd Team_Apple/public && npx serve .`) so Chrome grants microphone access.

#### B. Running the program

1. Power the Arduino and watch the serial monitor for “Connected!” plus periodic temperature, humidity, and distance logs.  
2. Confirm Firebase now shows `light`, `brightness`, `temperature_c`, `humidity`, and `security` nodes being updated.  
3. Open the dashboard; it will read the same nodes and stay in sync. The Arduino publishes sensor data every second, while the web UI writes user commands (lights/brightness) back to Firebase.

#### C. Using the program

- **Dashboard overview**: Four responsive cards (Lights, Temperature & Humidity, Energy, Security) plus persistent HELP and live status announcer.  
- **Accessibility controls**: High-contrast mode is enabled by default; toggle large-text for an extra 2px scale bump. Skip link + ARIA landmarks support keyboard and screen reader workflows.  
- **Light control**: Primary toggle and brightness slider update the LED via Firebase; speech commands “lights on/off” do the same.  
- **Temperature/humidity monitoring**: DHT11 readings stream into the card; switch between °C/°F with a single button.  
- **Energy usage**: Demo-only randomization helps presenters explain trends without needing real sensors.  
- **Security monitoring**: HC-SR04 distance drives the red proximity alert; the card also shows raw centimeters and status (“CLEAR” vs “WARNING”) with speech feedback once per state change.  
- **Voice control**: Chrome Web Speech API listens for “lights on/off” or “help”; fallback prompts appear on unsupported browsers.  
- **Keyboard navigation & screen reader support**: All controls meet ≥48 px target size, expose `aria-pressed` states, and announce changes via a polite live region.

#### D. Testing on different systems

- **Windows 10/11**: Test Chrome/Edge for microphone permissions, ensure speech synthesis plays through default speakers, and verify HID focus outlines.  
- **macOS Sonoma**: Use Safari + Chrome; Safari requires serving over HTTPS/localhost to unlock the microphone. Confirm VoiceOver reads the live region updates.  
- **Ubuntu 22.04 / Linux**: Verify Firefox handles Firebase fetch calls and that the fallback text command prompt appears when Web Speech API is unavailable.  
- **Browser compatibility checklist**: Toggle contrast/text size, operate all modules, trigger HELP, refresh energy stats, and force a security alert (hand near HC-SR04) in each browser session.  
- **Feature regression tests**: Disconnect Wi-Fi to ensure graceful console errors, re-enable to confirm auto-recovery; validate sensor → Firebase → UI loop in real time.

#### E. Troubleshooting

- **Common Arduino issues**  
  - *Cannot connect to Wi-Fi*: Double-check 2.4 GHz credentials and move the board away from USB hubs that cause interference.  
  - *Sensor values NaN*: Replace DHT11 wiring (signal must have a 10k pull-up) and ensure HC-SR04 has 5V power.  
  - *Firebase writes fail*: Confirm database secret is active; regenerate if revoked.

- **Web dashboard issues**  
  - *Voice button disabled*: Browser lacks Web Speech API; use Chrome or rely on the fallback prompt.  
  - *CORS/permission errors*: Serve via `npx serve` or similar local server to satisfy secure-context requirements.  
  - *Data not updating*: Verify Firebase rules allow read/write for your account or pass the `auth` query parameter correctly.

- **General sync problems**  
  - Use the Firebase console to watch node updates; if either side stops, restart that component (Arduino reset or browser refresh).  
  - Keep the Arduino IDE serial monitor open to catch runtime errors or HTTP status codes for REST calls.

