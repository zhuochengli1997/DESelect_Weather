import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import SearchIcon from "../images/SearchButton.svg";
import UVIcon from "../images/UVCircles.svg";
import CloudIcon from "../images/Cloud.svg";
import Windmill from "../images/Windmill.svg";
import SunRise from "../images/SunRise.svg";
import LineChart from "./TempChart";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import capitalCities from "./capitalCities.json";

interface CurrentWeather {
  temperature: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  describtion: [string];
  observationTime: string;
}

interface WeeklyData {
  date: string;
  dayOfWeek: string;
  temperature: number;
  humidity: number;
}

const Dashboard = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0"); // Get the day with leading zero if needed
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[today.getMonth()]; // Get the month name from array
  const formattedDate = `${day} ${month}`;
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [city, setCity] = useState("New York");
  const getDayOfWeek = (date: Date): string => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
  };
  const key = "f130aaedcc9a4b1df09fea6fc1e241b6";

  useEffect(() => {
    const fetchHistoricalWeatherData = async () => {
      const currentDate = new Date();
      const previousWeek: string[] = [];

      // Calculate dates for the previous week
      for (let i = 1; i <= 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        previousWeek.push(date.toISOString().split("T")[0]);
      }

      // Fetch historical weather data for each day of the previous week
      const requests = previousWeek.map(async (date) => {
        const response = await fetch(
          `https://api.weatherstack.com/historical?access_key=${key}&query=${city}&historical_date=${date}`
        );
        const data = await response.json();
        return {
          date,
          dayOfWeek: getDayOfWeek(new Date(date)),
          temperature: data?.historical?.[date]?.avgtemp ?? 0, // Adjust the property based on your API response
          humidity: data?.historical?.[date]?.sunhour ?? 0, // Adjust the property based on your API response
        };
      });

      // Wait for all API requests to complete
      Promise.all(requests)
        .then((results) => {
          setWeeklyData(results);
        })
        .catch((error) => {
          console.error("Error fetching historical weather data:", error);
        });
    };

    fetchHistoricalWeatherData();
  }, [city]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          "http://api.weatherstack.com/current",
          {
            params: {
              access_key: "f130aaedcc9a4b1df09fea6fc1e241b6",
              query: city, // Update with the desired city
            },
          }
        );
        const weatherData = response.data.current;
        console.log("Fetched Weather Data:", response.data);
        const currentWeather: CurrentWeather = {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          uvIndex: weatherData.uv_index,
          windSpeed: weatherData.wind_speed,
          describtion: weatherData.weather_descriptions,
          observationTime: weatherData.observation_time,
        };
        setCurrentWeather(currentWeather);
        console.log(currentWeather);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, [city]);

  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(event.target.value);
  };
  return (
    <div>
      <Modal show={show} onHide={handleClose} centered className="model">
        <Modal.Body>
          <Form.Select
            aria-label="Default select example"
            onChange={handleCityChange}
            value={city}
          >
            <option>Select City</option>
            {capitalCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="dashboard">
        {currentWeather && (
          <div className="humidity">
            <h1>{currentWeather.humidity}%</h1>
          </div>
        )}

        <div className="title-card">
          <button
            className="opensearch"
            onClick={handleShow}
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              margin: "20px",
              backgroundImage: `url(${SearchIcon})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100%",
              backgroundPosition: "center",
              backgroundColor: "transparent",
              width: "40px",
              height: "40px",
              border: "none",
              cursor: "pointer",
            }}
          />
          <h1>{city}</h1>
          <p>{formattedDate}</p>
        </div>

        <div
          className="wind-speed"
          style={{
            backgroundImage: `url(${Windmill})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "70%",
            backgroundPositionX: "100%",
            backgroundPositionY: "105%",
          }}
        >
          <h2>{currentWeather?.windSpeed} KM/h</h2>
          <p>{currentWeather?.describtion}</p>
        </div>

        <div className="forecast">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>&deg;C</th>
                <th>Sun Hours</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((day) => (
                <tr key={day.date}>
                  <td>{day.dayOfWeek}</td>
                  <td>{day.temperature}</td>
                  <td>{day.humidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="today-temp"
          style={{
            backgroundImage: `url(${CloudIcon})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "25%",
            backgroundPositionX: "90%",
            backgroundPositionY: "10%",
          }}
        >
          <h1>{currentWeather?.temperature}&deg;C</h1>
        </div>

        <div
          className="uv-index"
          style={{
            backgroundImage: `url(${UVIcon})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "80%",
            backgroundPositionX: "90px",
            backgroundPositionY: "40px",
          }}
        >
          <p>UV Index</p>
          <h1>{currentWeather?.uvIndex}</h1>
        </div>

        <div className="today-detail">
          <div
            className="sun-rise"
            style={{
              backgroundImage: `url(${SunRise})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "90%",
              backgroundPositionX: "-100%",
              backgroundPositionY: "108%",
            }}
          >
            <h3>Sun Rise</h3>
            <h2>{currentWeather?.observationTime}</h2>
          </div>
          <div className="timed-temp">
            <h2>Hourly Temperature</h2>
            <div className="chart-box">
              <LineChart city={city} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
