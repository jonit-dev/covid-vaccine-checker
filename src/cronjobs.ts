import cron from "node-cron";

import { locations } from "./data/locations";
import { VaccineChecker } from "./helpers/VaccineChecker";

export class CronJobs {
  public schedule() {
    const vaccineChecker = new VaccineChecker();

    console.log("Scheduling vaccine checks...");

    cron.schedule("* * * * *", () => {
      vaccineChecker.checkVaccine(locations);
    });
  }
}
