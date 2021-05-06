import axios, { AxiosRequestConfig } from "axios";
import dayjs from "dayjs";

import { SHOPPERS_VACCINES, WALMART_BOOKING } from "../constants/AxiosConstants";
import { shoppersDrugmartCookie, walmartCookie } from "../data/cookie";
import { IAvailablePlace, IAvailablePlaceResponse, IShoppersDrugmartResponse } from "../types/LocationTypes";
import { GenericHelper } from "./GenericHelper";
import { TelegramBotHelper } from "./TelegramBotHelper";

export class VaccineChecker {
  public telegramHelper: TelegramBotHelper;

  constructor() {
    this.telegramHelper = new TelegramBotHelper();
  }

  private static availablePlacesList: IAvailablePlace[] = [];

  private async walmartRequest(
    url: string,
    method: AxiosRequestConfig["method"],
    data?: object
  ) {
    return await WALMART_BOOKING.request({
      url,
      method,
      data,
      headers: {
        Cookie: walmartCookie,
      },
    });
  }

  private async shoppersRequest(
    url: string,
    method: AxiosRequestConfig["method"],
    data?: object
  ) {
    return await SHOPPERS_VACCINES.request({
      url,
      method,
      data,

      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,la;q=0.8",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-newrelic-id": "UwEFUF5XGwQHUFJUDwY=",
        "x-requested-with": "XMLHttpRequest",
        cookie: shoppersDrugmartCookie,
      },
    });
  }

  public async checkShoppersVaccine(): Promise<void> {
    let results: IShoppersDrugmartResponse[] = [];

    const response = await this.shoppersRequest(
      "/en/store/getstores?latitude=49.225787&longitude=-122.9975122&radius=500&unit=km&lookup=nearby&filters=RSV-CVW%3ATRUE%2CRSV-COV%3ATRUE&rpp=4&isCovidShotSearch=true&getCovidShotAvailability=true",
      "GET"
    );

    if (response.data) {
      results = [...results, ...response.data.results];

      let nextUrlData = response.data.next;
      let nextUrl = `/en/store/getstores?${nextUrlData}`;
      let maxPages = 50;
      let i = 0;

      while (nextUrlData && i < maxPages) {
        const newResponse = await this.shoppersRequest(nextUrl, "GET");

        results = [...results, ...newResponse.data.results];

        nextUrlData = newResponse.data.next;
        nextUrl = `/en/store/getstores?${nextUrlData}`;

        await GenericHelper.sleep(2000);

        i++;
      }
    }

    const availablePlaces: IShoppersDrugmartResponse[] = results.filter(
      (result) => result.FlusShotAvailableNow === true
    );

    if (availablePlaces.length > 0) {
      let messageToPrint = ``;

      for (const availablePlace of availablePlaces) {
        messageToPrint += `
        *** Check availability of COVID Vaccine on ShoppersDrugmart ${availablePlace.name} ***
        - Phone: ${availablePlace.phone}
        - City: ${availablePlace.city}
        - Address: ${availablePlace.address}
        - Postal Code: ${availablePlace.postalCode}
        `;
      }

      if (messageToPrint.length > 0) {
        await this.telegramHelper.sendMessage(messageToPrint);
      }
    } else {
      console.log("Hmm... nothing found available on shoppers yet!");
    }
  }

  public async checkWalmartVaccine(locations: object) {
    for (const [locationName, locationId] of Object.entries(locations)) {
      const response = await this.isAppointmentAvailableAtLocation(
        locationName,
        locationId
      );

      if (!response) {
        continue;
      }

      const { address, phone }: IAvailablePlaceResponse = response;

      console.log(
        `${locationName} (${locationId}) - ${address} is available! ✅`
      );

      // check if place is already added...

      const placeIndex = VaccineChecker.availablePlacesList.findIndex(
        (p) => p.id === locationId
      );

      const availableSlotPayload = {
        name: locationName,
        id: locationId,
        appointmentUrl: "https://portal.healthmyself.net/walmartbc/forms/1eo",
        phone,
        address,
        updatedAt: new Date(),
      };

      // if its not added yet...
      if (placeIndex === -1) {
        VaccineChecker.availablePlacesList.push(availableSlotPayload);

        await this.sendTelegramMessage(availableSlotPayload);
      } else {
        //if there're already an availablePlacesList there, we already warned telegram about it..

        //check last time we warned the users
        const now = dayjs(new Date());

        const lastAppointmentEntry = dayjs(
          VaccineChecker.availablePlacesList[placeIndex].updatedAt
        );

        const diff = now.diff(lastAppointmentEntry, "hours");

        // if there's already 6 hours since last warning...
        if (diff > 3) {
          await this.sendTelegramMessage(availableSlotPayload);
          VaccineChecker.availablePlacesList[placeIndex].updatedAt = new Date(); // update last update timestamp
        }
      }
    }
  }

  private async sendTelegramMessage(availablePlace: IAvailablePlace) {
    await this.telegramHelper.sendMessageWalmart(availablePlace);
  }

  private async isAppointmentAvailableAtLocation(
    locationName: string,
    locationId: string
  ): Promise<IAvailablePlaceResponse | undefined> {
    try {
      const response = await this.walmartRequest(
        `/walmartbc/guest/booking/4788/schedules\?locId\=${locationId}`,
        "GET"
      );

      if (response.status !== 200) {
        throw new Error(
          `Error while trying to fetch vaccine url for ${locationName}`
        );
      }

      if (response.data) {
        const { available, phone, address } = response.data.data[0];

        if (!available) {
          console.log(`${locationName}(${locationId}) is unavailable. ❌`);
          return;
        }

        return { available, phone, address };
      }
    } catch (error) {
      console.error(error);
    }
  }
}
