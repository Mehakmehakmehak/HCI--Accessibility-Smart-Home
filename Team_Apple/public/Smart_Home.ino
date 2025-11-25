#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <DHT.h>

char ssid[] = "iPhone";
char pass[] = "12345678";

String FIREBASE_HOST = "hci-smart-home-default-rtdb.firebaseio.com";
String FIREBASE_SECRET = "usWNzGu3q9TKUTpUh8mNmyj0iCO2801cPTmpFF4H";

int lightPin = 9;

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define TRIG_PIN 6
#define ECHO_PIN 5

WiFiSSLClient wifi;
HttpClient client = HttpClient(wifi, FIREBASE_HOST, 443);

String clean(String s){
  s.replace("\"", "");
  s.trim();
  return s;
}

void resetClient() {
  client.stop();
  delay(50);
}

void setup() {
  Serial.begin(9600);
  delay(1000);
  
  pinMode(lightPin, OUTPUT);
  analogWrite(lightPin, 0);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  dht.begin();

  Serial.println("Connecting...");
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected!");
}

long getDistance(){
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  long cm = duration * 0.034 / 2;
  if (cm <= 0 || cm > 400) return -1;
  return cm;
}

void loop() {

  // -------- LIGHT ----------
  client.get("/light.json?auth=" + FIREBASE_SECRET);
  String lightState = clean(client.responseBody());
  resetClient();

  Serial.print("Light: ");
  Serial.println(lightState);

  // ------- BRIGHTNESS -------
  client.get("/brightness.json?auth=" + FIREBASE_SECRET);
  String brightnessStr = clean(client.responseBody());
  resetClient();

  int brightness = brightnessStr.toInt();
  int pwm = map(brightness, 0, 100, 0, 255);

  Serial.print("Brightness: ");
  Serial.println(brightness);

  if (lightState == "ON") analogWrite(lightPin, pwm);
  else analogWrite(lightPin, 0);

  // ------- TEMP + HUM -------
  float hum = dht.readHumidity();
  float tempC = dht.readTemperature();
  
  if (!isnan(hum)) {
    client.put("/temperature_c.json?auth=" + FIREBASE_SECRET, "application/json", String(tempC));
    resetClient();

    client.put("/humidity.json?auth=" + FIREBASE_SECRET, "application/json", String(hum));
    resetClient();
  }

  // ------- SECURITY ---------
  long dist = getDistance();
  Serial.print("Distance: ");
  Serial.println(dist);

  String status = (dist != -1 && dist < 30) ? "WARNING" : "CLEAR";
  
  String json = "{ \"distance\": " + String(dist) + ", \"status\":\"" + status + "\" }";

  client.put("/security.json?auth=" + FIREBASE_SECRET, "application/json", json);
  resetClient();

  delay(1000);
}
