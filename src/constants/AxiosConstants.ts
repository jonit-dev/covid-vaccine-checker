import axios from "axios";

export const WALMART_BOOKING = axios.create({
  baseURL: "https://portal.healthmyself.net",
});
