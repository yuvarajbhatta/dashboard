import type { GeoSample } from '../types/telemetry';

export interface WeatherResult {
  tempF: number;
  description: string;
  highF: number | null;
  lowF: number | null;
  precipitationPercent: number | null;
}

const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function loadWeather(location: GeoSample | null): Promise<WeatherResult | null> {
  const key = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
  if (!key || !location) return null;

  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    units: 'imperial',
    appid: key
  });

  const response = await fetch(`${OPEN_WEATHER_URL}?${params.toString()}`);
  if (!response.ok) return null;
  const data = (await response.json()) as {
    main?: { temp?: number; temp_max?: number; temp_min?: number };
    weather?: Array<{ description?: string }>;
    rain?: { '1h'?: number };
    snow?: { '1h'?: number };
  };

  if (typeof data.main?.temp !== 'number') return null;

  return {
    tempF: data.main.temp,
    highF: data.main.temp_max ?? null,
    lowF: data.main.temp_min ?? null,
    description: data.weather?.[0]?.description ?? 'Weather available',
    precipitationPercent: data.rain?.['1h'] || data.snow?.['1h'] ? 100 : null
  };
}
