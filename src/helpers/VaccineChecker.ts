import { AxiosRequestConfig } from "axios";
import dayjs from "dayjs";

import { WALMART_BOOKING } from "../constants/AxiosConstants";
import { cookie } from "../data/cookie";
import { AvailablePlace, AvailablePlaceResponse } from "../types/LocationTypes";
import { TelegramBotHelper } from "./TelegramBot";

export class VaccineChecker {
  private static availablePlacesList: AvailablePlace[] = [];

  private async request(
    url: string,
    method: AxiosRequestConfig["method"],
    data?: object
  ) {
    return await WALMART_BOOKING.request({
      url,
      method,
      data,
      headers: {
        Cookie: cookie,
      },
    });
  }

  public async checkVaccine(locations: object) {
    for (const [locationName, locationId] of Object.entries(locations)) {
      const response = await this.isAppointmentAvailableAtLocation(
        locationName,
        locationId
      );

      if (!response) {
        continue;
      }

      const { address, phone }: AvailablePlaceResponse = response;

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
        createdAt: new Date(),
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
          VaccineChecker.availablePlacesList[placeIndex].createdAt
        );

        const diff = now.diff(lastAppointmentEntry, "hours");

        // if there's already 6 hours since last warning...
        if (diff > 3) {
          await this.sendTelegramMessage(availableSlotPayload);
        }
      }
    }
  }

  private async sendTelegramMessage(availablePlace: AvailablePlace) {
    const telegramBot = new TelegramBotHelper();
    await telegramBot.sendMessageToGroup(
      `*** New Available Appointment Found ***
      - Name: ${availablePlace.name}
      - Url: ${availablePlace.appointmentUrl}
      - Address: ${availablePlace.address}
      - Phone: ${availablePlace.phone}

      PS: You should look for the EXACT location name using the form.
      Sometimes the link doesn't work. Just keep trying.
      `
    );
  }

  private async isAppointmentAvailableAtLocation(
    locationName: string,
    locationId: string
  ): Promise<AvailablePlaceResponse | undefined> {
    try {
      const response = await this.request(
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
