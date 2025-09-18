import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ForecastChart = ({ forecastData }) => {
  if (!forecastData || !forecastData.data || !forecastData.data.list) {
    return null;
  }

  const data = forecastData.data.list.map((s) => ({
    time: new Date(s.dt * 1000).toLocaleString('it-IT', {
      weekday: 'short',
      hour: '2-digit'
    }),
    temp: s.main.temp,
    humidity: s.main.humidity,
    wind: s.wind.speed
  }));

  return (
    <div style={{ display: "grid", gap: "2rem", marginTop: "50px" }}>
      <h1 className="text-3xl text-center">Temperature</h1>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="°C" />
          <Tooltip />
          <Line type="monotone" dataKey="temp" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <h1 className="text-3xl text-center">Humidity</h1>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <h1 className="text-3xl text-center">Wind</h1>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="m/s" />
          <Tooltip />
          <Line type="monotone" dataKey="wind" stroke="#e16826" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
