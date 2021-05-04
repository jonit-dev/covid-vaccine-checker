import TelegramBot from "node-telegram-bot-api";

import { TelegramBotID } from "../constants/TelegramConstants";

export class TelegramBotHelper {
  bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
      polling: true,
    });
  }

  public sendMessageToGroup(message: string) {
    this.bot.sendMessage(TelegramBotID, message);
  }
}
