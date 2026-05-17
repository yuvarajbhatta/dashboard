import { useEffect, useState } from 'react';

export interface BatteryStatus {
  supported: boolean;
  level: number | null;
  charging: boolean | null;
}

export function useBatteryStatus() {
  const [status, setStatus] = useState<BatteryStatus>({
    supported: false,
    level: null,
    charging: null
  });

  useEffect(() => {
    let battery: BatteryManager | null = null;
    let cancelled = false;
    let update: (() => void) | null = null;

    async function load() {
      if (!navigator.getBattery) return;
      battery = await navigator.getBattery();
      update = () => {
        if (!battery || cancelled) return;
        setStatus({
          supported: true,
          level: battery.level,
          charging: battery.charging
        });
      };
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    }

    void load();

    return () => {
      cancelled = true;
      if (battery && update) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  return status;
}
