import { Star } from "../icons/ThemeIcons.jsx";
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const Card = ({ apiUrl, currentWeather, weatherIcon, favorites, onAddFavorite }) => {
  return (
    <div className="card w-96 bg-base-100 shadow-sm mt-8 text-left mx-auto">
      <div className="card-body">
        <span className="badge badge-sm badge-warning">
          Exact Location: {currentWeather?.city} - {currentWeather?.country}
        </span>
        <Star
          onClick={() => onAddFavorite(currentWeather.city)}
          style={{
            fill: favorites.includes(currentWeather.city) ? "#000" : "#fff",
          }}
        />
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold">{currentWeather?.weather}</h2>
          <span className="text-xl bg-white">
            <img src={weatherIcon} alt={currentWeather?.weather} />
          </span>
        </div>

        <ul className="mt-6 flex flex-col gap-2 text-xs">
          {Object.entries(currentWeather).map(([key, value]) => {
            if (
              key === "city" ||
              key === "country" ||
              key === "weather" ||
              key === "icon"
            ) {
              return null;
            }

            if (key === "temperature" || key === "feels_like") {
              value += "°";
            } else {
              value += "%";
            }

            return (
              <li key={key}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 me-2 inline-block text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                </span>
              </li>
            );
          })}
        </ul>
        <button
          className="btn btn-outline mt-2"
          onClick={
            () => {
              navigator.clipboard.writeText(apiUrl);
              toast.custom(
                (t) => (
                  <div
                    className={`alert alert-success shadow-lg transition-opacity duration-1500 ${
                      t.visible ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 shrink-0 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21
                           12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>URL copied!</span>
                  </div>
                ),
                { duration: 2000 }
              );
            }
          }
        >
          Copy Link
        </button>
        <div className="mt-4 text-center">
          <p className="mb-2">Share via QR Code</p>
          <QRCodeSVG
            className="mx-auto"
            value={`
              City: ${currentWeather.city}
              Temperature: ${currentWeather.temperature}°
              Feels like: ${currentWeather.feels_like}°
              Humidity: ${currentWeather.humidity}%
            `}
            size={128}
          />
        </div>

      </div>
    </div>
  );
};

export default Card;
