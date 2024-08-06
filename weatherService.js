import { DateTime } from "luxon";

const API_KEY = "46be5d63c4071928524c16646168873d";
const URL_CITY = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}&q=`;
const URL_FORECAST = `https://api.openweathermap.org/data/2.5/forecast?&units=metric&appid=${API_KEY}&`;

let weatherData = null;
let forecastedData = null;
let data = null;

async function getWeatherForCity(city) {
  try {
    city = city.toLowerCase().trim();
    const res = await fetch(URL_CITY + city);
    weatherData = null;
    forecastedData = null;
    if (!res.ok) throw new Error("💥 Some error in fetching response 💥");
    weatherData = await res.json();
    forecastedData = await _getForecastWeather(weatherData.coord);
    _prepareFormattedData(forecastedData);
  } catch (err) {
    console.error(err.message);
  }
}

async function _getForecastWeather({ lat, lon }) {
  try {
    const res = await fetch(URL_FORECAST + `lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error("💥 Some error in fetching response 💥");
    return await res.json();
  } catch (err) {
    console.error(err.message);
  }
}

function _prepareFormattedData(forecastedData) {
  console.log(forecastedData);
  forecastedData.list = forecastedData.list.reduce((acc, curr, i, arr) => {
    if (i === 0) {
      acc[i] = curr;
      return acc;
    }
    const currDate = curr.dt_txt.split(" ")[0];
    const prevDate = acc.at(-1).dt_txt.split(" ")[0];
    const time = curr.dt_txt.split(" ")[1].split(":")[0];
    if (i > 0 && time === "12" && currDate !== prevDate) {
      acc.push(curr);
      return acc;
    }
    if (i === arr.length - 1 && acc.length !== 6) {
      acc.push(curr);
      return acc;
    }
    return acc;
  }, []);
  const timezone = forecastedData.city.timezone;
  data = {
    common: {
      city: forecastedData.city.name,
      country: forecastedData.city.country,
      lat: forecastedData.city.coord.lat,
      lon: forecastedData.city.coord.lon,
      selected: 0,
      timezone,
    },
    forecasts: [],
  };

  forecastedData.list.forEach((obj) => {
    data.forecasts.push({
      id: obj.dt,
      dt_txt: obj.dt_txt,
      mainTime: _getFormattedTime(timezone, obj.dt, "cccc, d LLLL"),
      forecastTime: _getFormattedTime(timezone, obj.dt, "ccc, d"),
      temp: obj.main.temp,
      tempMin: obj.main.temp_min,
      tempMax: obj.main.temp_max,
      feelsLike: obj.main.feels_like,
      weatherType: _formatToPascalCase(obj.weather[0].description),
      iconUrl: _getIconUrl(obj.weather[0].icon),
      dt: obj.dt,
    });
  });
}

function _getFormattedTime(timezone, timestamp, format) {
  return DateTime.fromSeconds(timestamp + timezone, { zone: "utc" }).toFormat(
    format
  );
}

function _getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function _formatToPascalCase(str) {
  return str
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substring(1))
    .join(" ");
}

export { getWeatherForCity, data };
