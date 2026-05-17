import type { GeoSample } from '../types/telemetry';

export interface WeatherResult {
  tempF: number;
  description: string;
  highF: number | null;
  lowF: number | null;
  precipitationPercent: number | null;
}

export async function loadWeather(location: GeoSample | null): Promise<WeatherResult | null> {
  if (!location) return null;

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    timezone: 'auto'
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
    };
    daily?: {
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
    };
  };

  if (typeof data.current?.temperature_2m !== 'number') {
    return null;
  }

  const weatherDescription = getWeatherDescription(
    data.current?.weather_code ?? 0
  );

  return {
    tempF: data.current.temperature_2m,
    highF: data.daily?.temperature_2m_max?.[0] ?? null,
    lowF: data.daily?.temperature_2m_min?.[0] ?? null,
    description: weatherDescription,
    precipitationPercent:
      data.daily?.precipitation_probability_max?.[0] ?? null
  };
}


function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Freezing Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    61: 'Light Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    80: 'Rain Showers',
    81: 'Heavy Showers',
    95: 'Thunderstorm'
  };

  return weatherCodes[code] ?? 'Weather Available';
}