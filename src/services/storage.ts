import localforage from 'localforage';
import type { TripRecord } from '../types/telemetry';

const tripStore = localforage.createInstance({
  name: 'tesla-sensor-dash',
  storeName: 'trip_history',
  description: 'Tesla Sensor Dash trip records'
});

const TRIPS_KEY = 'trips';

export async function loadTrips() {
  return (await tripStore.getItem<TripRecord[]>(TRIPS_KEY)) ?? [];
}

export async function saveTrip(record: TripRecord) {
  const trips = await loadTrips();
  const nextTrips = [record, ...trips].slice(0, 50);
  await tripStore.setItem(TRIPS_KEY, nextTrips);
  return nextTrips;
}

export async function clearTrips() {
  await tripStore.setItem(TRIPS_KEY, []);
}
