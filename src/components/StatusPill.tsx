import clsx from 'clsx';

interface StatusPillProps {
  label: string;
  status: string;
  active?: boolean;
}

export function StatusPill({ label, status, active }: StatusPillProps) {
  return (
    <div
      className={clsx(
        'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[0.66rem] font-bold uppercase tracking-[0.14em]',
        active ? 'border-lime-300/40 bg-lime-300/10 text-lime-200' : 'border-white/10 bg-white/[0.04] text-slate-300'
      )}
    >
      <span className={clsx('h-2 w-2 rounded-full', active ? 'bg-lime-300 shadow-[0_0_14px_rgba(163,230,53,0.9)]' : 'bg-slate-500')} />
      <span>{label}</span>
      <span className="text-current/60">{status}</span>
    </div>
  );
}
