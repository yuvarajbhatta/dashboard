import type { ReactNode } from 'react';
import { Gauge, Settings, ShieldCheck, Zap } from 'lucide-react';

export type NavTab = 'dashboard' | 'performance' | 'safety' | 'settings';

export function BottomNav({ active, onSelect }: { active: NavTab; onSelect: (tab: NavTab) => void }) {
  return (
    <nav className="bottom-nav">
      <NavButton label="Dashboard" active={active === 'dashboard'} icon={<Gauge className="h-5 w-5" />} onClick={() => onSelect('dashboard')} />
      <NavButton label="Performance" active={active === 'performance'} icon={<Zap className="h-5 w-5" />} onClick={() => onSelect('performance')} />
      <NavButton label="Safety Score" active={active === 'safety'} icon={<ShieldCheck className="h-5 w-5" />} onClick={() => onSelect('safety')} />
      <NavButton label="Settings" active={active === 'settings'} icon={<Settings className="h-5 w-5" />} onClick={() => onSelect('settings')} />
    </nav>
  );
}

function NavButton({ label, active, icon, onClick }: { label: string; active: boolean; icon: ReactNode; onClick: () => void }) {
  return (
    <button className={active ? 'nav-button active' : 'nav-button'} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}
