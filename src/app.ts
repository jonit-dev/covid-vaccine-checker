import express from "express";

import { CronJobs } from "./cronjobs";

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello there");
});
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

  const cronjobs = new CronJobs();

  cronjobs.schedule();
});
