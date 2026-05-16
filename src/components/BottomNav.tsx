import type { ReactNode } from 'react';
import { Gauge, Minimize2, Settings, SlidersHorizontal, Zap } from 'lucide-react';

export type NavTab = 'dashboard' | 'sensors' | 'performance' | 'settings';

export function BottomNav({ active, onSelect, onMinimize }: { active: NavTab; onSelect: (tab: NavTab) => void; onMinimize: () => void }) {
  return (
    <nav className="bottom-nav">
      <NavButton label="Dashboard" active={active === 'dashboard'} icon={<Gauge className="h-5 w-5" />} onClick={() => onSelect('dashboard')} />
      <NavButton label="Sensors" active={active === 'sensors'} icon={<SlidersHorizontal className="h-5 w-5" />} onClick={() => onSelect('sensors')} />
      <NavButton label="Performance" active={active === 'performance'} icon={<Zap className="h-5 w-5" />} onClick={() => onSelect('performance')} />
      <NavButton label="Settings" active={active === 'settings'} icon={<Settings className="h-5 w-5" />} onClick={() => onSelect('settings')} />
      <NavButton label="Minimize" active={false} icon={<Minimize2 className="h-5 w-5" />} onClick={onMinimize} />
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
