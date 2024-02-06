import axios from "axios";

const URL = "http://api.weatherstack.com/current";
const API_KEY = "f130aaedcc9a4b1df09fea6fc1e241b6";

export const fetchCurrent = async (query: string) => {
  const { data } = await axios.get(URL, {
    params: {
      query: query,
      units: "m",
      access_key: API_KEY,
    },
  });
  return data;
};
