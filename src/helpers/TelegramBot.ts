import TelegramBot from "node-telegram-bot-api";

import { telegramBot } from "../app";

export class TelegramBotHelper {
  public bot: TelegramBot = telegramBot;

  public sendMessageToGroup(message: string) {
    // this.bot.sendMessage(telegramBotGroupID, message);
  }
}
