import TelegramBot from "node-telegram-bot-api";

import { telegramBot } from "../app";
import { telegramBotGroupID } from "../constants/TelegramConstants";
import { IAvailablePlace } from "../types/LocationTypes";

export class TelegramBotHelper {
  bot: TelegramBot;

  constructor() {
    this.bot = telegramBot;
  }

  public async sendMessageWalmart(availablePlace: IAvailablePlace) {
    await this.bot.sendMessage(
      telegramBotGroupID,
      `*** New Available Appointment Found ***
    - Name: ${availablePlace.name}
    - Url: ${availablePlace.appointmentUrl}
    - Address: ${availablePlace.address}
    - Phone: ${availablePlace.phone}

    READ ME: 
    - You should look for the EXACT location name using the form.
    - ** Sometimes the link doesn't work. Just keep trying. You should be quick! 💨
    - If you find our group helpful, please share https://t.me/bcvaccineappointments
    `
    );
  }

  public async sendMessage(message: string) {
    await this.bot.sendMessage(telegramBotGroupID, message);
  }
}
