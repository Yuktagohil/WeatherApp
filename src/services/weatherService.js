import { DateTime } from "luxon";

const API_KEY = "Put your API Key";
const BASE_URL = "https://api.openweathermap.org/data";

// https://api.openweathermap.org/data/3.0/onecall?lat=48.8534&lon=2.3488&exclude=current,minutely,hourly,alerts&appid=1fa9ff4126d95b8db54f3897a208e91c&units=metric

const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
  } = data;

  const { main: details, icon } = weather[0];

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
  };
};

const formatForecastWeather = (data) => {
  let { timezone, daily } = data;
  daily = daily.slice(0, 5).map((d) => {
    return {
      title: formatToLocalTime(d.dt, timezone, "ccc"),
      temp: d.temp.day,
      icon: d.weather[0].icon,
    };
  });

  // hourly = hourly.slice(1, 11).map((d) => {
  //   return {
  //     title: formatToLocalTime(d.dt, timezone, "hh:mma"),
  //     temp: d.temp,
  //     icon: d.weather[0].icon,
  //   };
  // });

  return { timezone, daily };
};

const formatHourlyForecast = (data) => {
  const { timezone } = data.city;

  const hourly = data.list.map((d) => {
    return {
      title: formatToLocalTime(d.dt, timezone, "hh:mma"),
      temp: d.main.temp,
      icon: d.weather[0].icon,
    };
  });

  let hourlyChunk = {};

  for (let i = 0; i < hourly.length; i += 8) {
    hourlyChunk[i / 8] = hourly.slice(i, i + 8);
}

  return hourlyChunk;
};

const getFormattedWeatherData = async (searchParams) => {
  const formattedCurrentWeather = await getWeatherData(
    "2.5/weather",
    searchParams
  ).then(formatCurrentWeather);

  const { lat, lon } = formattedCurrentWeather;

  const formattedForecastWeather = await getWeatherData(
    "3.0/onecall", {
    lat,
    lon,
    exclude: "current,minutely,hourly,alerts",
    units: searchParams.units,
  }).then(formatForecastWeather);

  const formattedHourlyForecast = await getWeatherData(
    "2.5/forecast",
    searchParams
  ).then(formatHourlyForecast);

formattedForecastWeather.daily = formattedForecastWeather.daily.map((obj, i) => {
  obj['hourly'] = formattedHourlyForecast[i];
  return obj;
});

  return { ...formattedCurrentWeather, ...formattedForecastWeather };
};

const formatToLocalTime = (
  secs,
  zone,
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };