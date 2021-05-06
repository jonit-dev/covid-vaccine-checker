import axios from "axios";
import cron from "node-cron";

import { telegramBot } from "./app";
import { telegramBotGroupID } from "./constants/TelegramConstants";
import { locations } from "./data/locations";
import { VaccineChecker } from "./helpers/VaccineChecker";

export class CronJobs {
  public schedule() {
    const vaccineChecker = new VaccineChecker();

    console.log("Scheduling cron jobs");

    cron.schedule("* * * * *", () => {
      vaccineChecker.checkWalmartVaccine(locations);
    });

    cron.schedule("0 */6 * * *", () => {
      console.log(`Checking shoppers drugmart vaccine availability...`);
      vaccineChecker.checkShoppersVaccine();
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

    cron.schedule("0 */4 * * *", async () => {
      await telegramBot.sendMessage(
        telegramBotGroupID,
        `*** Other useful appointment links ***
        - Pharmasave: https://pharmasave.com/wp-content/uploads/2021/05/COVID-Vaccine-Store-List-PDF_BC-05-04.pdf
        - BC COVID 19 Pharmacies map: https://immunizebc.ca/initial-covid-19-vaccines-pharmacies
        `
      );
    });
  }
}
