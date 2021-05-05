import axios from "axios";
import cron from "node-cron";

import { locations } from "./data/locations";
import { VaccineChecker } from "./helpers/VaccineChecker";

export class CronJobs {
  public schedule() {
    const vaccineChecker = new VaccineChecker();

    console.log("Scheduling cron jobs");

    cron.schedule("* * * * *", () => {
      vaccineChecker.checkVaccine(locations);
    });

    cron.schedule("*/10 * * * *", async () => {
      const response = await axios.get(
        "https://joao-vaccine-checker.herokuapp.com/"
      );
      console.log(
        "Pinged https://joao-vaccine-checker.herokuapp.com/ to prevent idle dyno!"
      );

      if (response.status === 200) {
        console.log("Refreshed!");
      }
    });
  }
}
