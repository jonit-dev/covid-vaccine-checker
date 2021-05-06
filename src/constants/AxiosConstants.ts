import axios from "axios";

export const WALMART_BOOKING = axios.create({
  baseURL: "https://portal.healthmyself.net",
});

export const SHOPPERS_VACCINES = axios.create({
  baseURL: "https://www1.shoppersdrugmart.ca",
});
