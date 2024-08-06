import VanillaTilt from "vanilla-tilt";
import { getWeatherForCity, data } from "./weatherService";

_enableTiltAnimation();

const formSearchEle = document.getElementById("form-search-city");
formSearchEle.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(e) {
  e.preventDefault();
  const inputEle = e.target[0];
  const city = inputEle.value;
  if (city.length < 3) return;
  inputEle.value = "";
  await getWeatherForCity(city);
  _renderDataInDOM(data);
}

function _renderDataInDOM(data) {
  if (!data) return;
  console.log(data);
  const { common } = data;
  const weather = data.forecasts[common.selected];
  const weatherDataContainer = document.getElementById(
    "container-result-weather"
  );
  weatherDataContainer.innerHTML = "";
  weatherDataContainer.insertAdjacentHTML(
    "afterbegin",
    `
        <h3>
            <i class="fa-regular fa-calendar-days"></i>
            <span>${weather.mainTime}</span>
        </h3>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <img src=${weather.iconUrl} />   
            <div style="display:flex; flex-direction:column;">
                <h2>
                    <i style="text-align: center;" class="fa-solid fa-temperature-three-quarters"></i>
                    <span>${weather.temp}&deg;</span>
                </h2>
                <h4>Feels like ${weather.feelsLike}&deg;</h4>
            </div>           
        </div>
        <h4>${weather.weatherType}</h4>
        <h2>
            <i class="fa-solid fa-location-dot"></i>
            <span>${common.city}, ${common.country}</span>
        </h2>
    `
  );

  _renderForcastDataInDOM(data);
}

function _renderForcastDataInDOM(data) {
  if (!data) return;
  console.log(data);
  const { common } = data;
  const weather = data.forecasts[common.selected];
  const weatherDataContainer = document.getElementById("forecasts");
  weatherDataContainer.innerHTML = "";
  data.forecasts.slice(1).forEach((ele) => {
    weatherDataContainer.insertAdjacentHTML(
      "beforeend",
      `
    <div class="container-mini tilt">
        <div class="z-dim">
            <span>${ele.forecastTime}</span>
            <h4>${ele.temp}&deg;</h4>
            <img src=${ele.iconUrl} />
            <span>${ele.weatherType}</span>
        </div>
    </div>
        `
    );
  });
  _enableTiltAnimation();
}

function _enableTiltAnimation() {
  VanillaTilt.init(document.querySelectorAll(".tilt"), {
    glare: true,
    scale: 1.1,
    "max-glare": 0.8,
  });
}
