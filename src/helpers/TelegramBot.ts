import TelegramBot from "node-telegram-bot-api";

import { telegramBot } from "../app";
import { telegramBotGroupID } from "../constants/TelegramConstants";

export class TelegramBotHelper {
  public bot: TelegramBot = telegramBot;

  public sendMessageToGroup(message: string) {
    this.bot.sendMessage(telegramBotGroupID, message);
  }
}
