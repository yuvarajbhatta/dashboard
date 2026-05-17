import { useEffect, useState } from 'react';
import { loadWeather, type WeatherResult } from '../services/weather';
import type { GeoSample } from '../types/telemetry';

export function useWeather(location: GeoSample | null) {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState<'unconfigured' | 'waiting' | 'loading' | 'available' | 'unavailable'>('unconfigured');

  useEffect(() => {
    const key = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
    if (!key) {
      setStatus('unconfigured');
      setWeather(null);
      return;
    }
    if (!location) {
      setStatus('waiting');
      setWeather(null);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    loadWeather(location)
      .then((result) => {
        if (cancelled) return;
        setWeather(result);
        setStatus(result ? 'available' : 'unavailable');
      })
      .catch(() => {
        if (cancelled) return;
        setWeather(null);
        setStatus('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [location?.latitude, location?.longitude]);

  return { weather, status };
}
