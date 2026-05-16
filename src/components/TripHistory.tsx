import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { distanceFromMeters, distanceLabel, formatLongDuration, round, speedFromMps, speedLabel } from '../lib/format';
import { useDashboardStore } from '../store/dashboardStore';

export function TripHistory() {
  const trips = useDashboardStore((state) => state.trips);
  const units = useDashboardStore((state) => state.units);

  return (
    <section className="hud-panel p-4">
      <div className="mb-4 flex items-center gap-2 text-cyan-200">
        <CalendarClock className="h-5 w-5" />
        <h2 className="panel-title">Trip History</h2>
      </div>
      <div className="max-h-72 space-y-2 overflow-auto pr-1">
        {trips.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
            End a trip to store its summary locally on this iPhone.
          </div>
        ) : (
          trips.slice(0, 8).map((trip) => (
            <div key={trip.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-white">{format(new Date(trip.date), 'MMM d, yyyy h:mm a')}</div>
                <div className="font-mono text-lg font-black text-lime-200">{trip.safetyScore}</div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-[0.7rem] text-slate-300">
                <span>{formatLongDuration(trip.durationMs)}</span>
                <span>
                  {round(distanceFromMeters(trip.distanceMeters, units), 2)} {distanceLabel(units)}
                </span>
                <span>
                  {Math.round(speedFromMps(trip.maxSpeedMps, units))} {speedLabel(units)}
                </span>
                <span>{round(trip.maxGForce, 2)}G</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
