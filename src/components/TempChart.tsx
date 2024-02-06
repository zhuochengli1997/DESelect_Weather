import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface LineChartProps {
  city: string;
}

const LineChart: React.FC<LineChartProps> = ({ city }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<"line"> | null>(null);
  const [hourlyTemperatures, setHourlyTemperatures] = useState<number[]>([]);

  useEffect(() => {
    const fetchHourlyTemperatureData = async () => {
      try {
        const currentDate = new Date();
        const previousDay = new Date(currentDate);
        previousDay.setDate(currentDate.getDate() - 1); // Calculate the date of the previous day
        const formattedDate = formatDate(previousDay);

        const response = await fetch(
          `https://api.weatherstack.com/historical?access_key=f130aaedcc9a4b1df09fea6fc1e241b6&query=${city}&historical_date=${formattedDate}&hourly=1`
        );
        const data = await response.json();

        if (
          data.historical &&
          data.historical[formattedDate] &&
          data.historical[formattedDate].hourly
        ) {
          const temperatures = data.historical[formattedDate].hourly.map(
            (hour: any) => hour.temperature
          );
          setHourlyTemperatures(temperatures);
        } else {
          console.error("Hourly temperature data not found in response");
        }
      } catch (error) {
        console.error("Error fetching hourly temperature data:", error);
      }
    };

    fetchHourlyTemperatureData();
  }, [city]);

  useEffect(() => {
    if (chartRef && chartRef.current && hourlyTemperatures.length > 0) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy(); // Destroy the existing chart instance
        }
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: Array.from(
              { length: 8 },
              (_, i) => `${String(i * 2).padStart(2, "0")}:00`
            ), // Bi-hourly labels

            datasets: [
              {
                label: "Hourly Temperature",
                data: hourlyTemperatures,
                borderColor: "#f3f3f3",
                tension: 0.5,
              },
            ],
          },
          options: {
            aspectRatio: 2,
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  display: false,
                },
                ticks: {
                  color: "#f3f3f3",
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: "#f3f3f3",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return context.parsed.y + "°C"; // Display y-axis value with '°C' suffix
                  },
                },
              },
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy the chart instance when the component unmounts
      }
    };
  }, [hourlyTemperatures]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return <canvas ref={chartRef} />;
};

export default LineChart;
