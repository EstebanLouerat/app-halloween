import express, { json } from "express";
import cors from "cors";
const app = express();

app.use(json());
app.use(cors());

let settings = {
  timerDuration: 90,
  killerTimerDuration: 5,
  killerCooldown: 20,
  playerTimerRate: [1, 1.5, 2, 2.5],
};

app.get("/", (req, res) => {
  res.json("Server is up !");
});

app.get("/api/settings", (req, res) => {
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  settings = req.body;
  console.log("Settings updated successfully");
  res.json({ message: "Settings updated successfully" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
