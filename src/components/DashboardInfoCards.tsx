import { BatteryWarning, CloudSun, Compass } from 'lucide-react';
import type { WeatherResult } from '../services/weather';

export function HeadingCard({ heading, label }: { heading: number | null; label: string }) {
  const value = heading === null ? null : Math.round(((heading % 360) + 360) % 360);
  return (
    <section className="cockpit-panel info-card heading-card">
      <div className="panel-kicker"><Compass className="h-4 w-4 text-sky-300" />Heading</div>
      <div className="tesla-compass-card">
        <div className="tesla-compass-direction">
          {value === null ? '--' : label}
        </div>

        <div className="tesla-compass-window">
          <div
            className="tesla-compass-tape"
            style={{
              transform: `translateX(calc(-${value ?? 0} / 360 * var(--compass-loop-width)))`
            }}
          >
            {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE', 'S'].map((direction, index) => (
              <span key={`${direction}-${index}`}>{direction}</span>
            ))}
          </div>

          <div className="tesla-compass-center-line" />
        </div>

        <div className="tesla-compass-angle">
          {value === null ? '--' : `${value}°`}
        </div>
      </div>
    </section>
  );
}

export function WeatherCard({ weather, status }: { weather: WeatherResult | null; status: string }) {
  return (
    <section className="cockpit-panel info-card weather-card">
      <div className="panel-kicker"><CloudSun className="h-4 w-4 text-sky-200" />Weather Forecast</div>
      {weather ? (
        <div className="weather-layout">
          <div>
            <div className="weather-temp">{Math.round(weather.tempF)}°F</div>
            <div className="weather-desc">{weather.description}</div>
          </div>
          <div className="weather-details">
            <span>High <strong>{weather.highF === null ? '--' : `${Math.round(weather.highF)}°F`}</strong></span>
            <span>Low <strong>{weather.lowF === null ? '--' : `${Math.round(weather.lowF)}°F`}</strong></span>
            <span>Rain <strong>{weather.precipitationPercent === null ? '--' : `${weather.precipitationPercent}%`}</strong></span>
          </div>
        </div>
      ) : (
        <div className="unavailable-text">{status === 'waiting' ? 'Waiting for GPS' : 'Weather unavailable'}</div>
      )}
    </section>
  );
}

export function PhoneTemperatureCard() {
  return (
    <section className="cockpit-panel info-card phone-temp-card">
      <div>
        <div className="panel-kicker"><BatteryWarning className="h-4 w-4 text-sky-200" />Phone Temperature</div>
        <div className="phone-temp-state">Unavailable on Safari</div>
      </div>
      <div className="thermal-ring">
        <div className="phone-outline" />
      </div>
    </section>
  );
}
