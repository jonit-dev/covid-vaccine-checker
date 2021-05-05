import express from "express";
import TelegramBot from "node-telegram-bot-api";

import { CronJobs } from "./cronjobs";

require("dotenv").config();

export const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: true,
});

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello there");
});
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

  const cronjobs = new CronJobs();

  cronjobs.schedule();
});
