document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("spinner");
  const form = document.getElementById("form");
  const inp = document.getElementById("inp");
  const list = document.getElementById("list");

  const URL = "https://restcountries.com/v3.1/name/";
  const URL_CODE = "https://restcountries.com/v3.1/alpha/";
  const WEATHER_URL = "https://wttr.in/";

  let countryName = null;

  const toggleSpinner = (show) => {
    spinner.style.display = show ? "flex" : "none";
  };

  const getWeather = async (city) => {
    const response = await fetch(`${WEATHER_URL}${city}?format=j1`); // Запрос погоды через API wttr.in
    const weatherData = await response.json();
    const currentWeather = weatherData.current_condition[0]; // Берем первый элемент массива погоды
    return `${currentWeather.weatherDesc[0].value}, ${currentWeather.temp_C}° Wind: ${currentWeather.winddir16Point} ${currentWeather.windspeedKmph} km/h`;
  };

  const displayCountryData = async (countryData) => {
    const countryName = countryData.name.common;
    const capital = countryData.capital ? countryData.capital[0] : "No capital"; // Проверка наличия столицы
    const weather = await getWeather(capital); // Получаем погоду в столице

    const countryInfo = document.createElement("div");
    countryInfo.innerHTML = `
        <h2>Country: ${countryName}</h2>
        <p>Capital: ${capital}</p>
        <p>Current weather: ${weather}</p>
    `;
    list.appendChild(countryInfo); // Добавляем блок с информацией о стране
  };

  const getData = async (country) => {
    try {
      toggleSpinner(true);
      list.innerHTML = "";

      const data = await fetch(URL + country);
      const parseData = await data.json();
      const mainCountry = parseData[0];

      await displayCountryData(mainCountry);

      const borders = mainCountry.borders;

      if (borders) {
        const borderCountries = borders.map(async (code) => {
          const borderData = await fetch(URL_CODE + code); // Получаем данные о соседних странах
          const borderParseData = await borderData.json();
          return borderParseData[0];
        });

        const parseBorderCountries = await Promise.all(borderCountries); // Ожидаем завершения всех запросов границ

        const bordersSection = document.createElement("div");
        bordersSection.innerHTML = "<h3>Bordering countries:</h3>";
        list.appendChild(bordersSection); // Создаем блок для отображения стран-соседей

        for (const borderCountry of parseBorderCountries) {
          const borderCountryInfo = document.createElement("div");
          const borderWeather = await getWeather(
            borderCountry.capital ? borderCountry.capital[0] : "No capital"
          ); 
          borderCountryInfo.innerHTML = `
                    <h4>Country name: ${borderCountry.name.common}</h4>
                    <p>Capital: ${
                      borderCountry.capital
                        ? borderCountry.capital[0]
                        : "No capital"
                    }</p>
                    <p>Current weather: ${borderWeather}</p>
                `;
          bordersSection.appendChild(borderCountryInfo); 
        }
      } else {
        const noBorders = document.createElement("p");
        noBorders.innerText = "This country has no borders."; //Eсли границ нет
        list.appendChild(noBorders);
      }

      toggleSpinner(false);
    } catch (error) {
      toggleSpinner(false);
      alert("An error occurred. Please try again.");
    }
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (countryName) {
      getData(countryName);
    } else {
      throw new Error("Country name must by field");
    }
  });

  inp.addEventListener("change", (e) => {
    countryName = e.target.value;
  });
});
