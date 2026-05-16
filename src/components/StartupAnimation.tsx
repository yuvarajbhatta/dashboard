import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function StartupAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1900);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-carbon"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }} className="text-center">
            <div className="startup-ring mx-auto mb-6" />
            <div className="font-mono text-3xl font-black uppercase text-white md:text-5xl">Tesla Sensor Dash</div>
            <div className="mt-3 text-xs font-bold uppercase tracking-[0.34em] text-cyan-200">Telemetry Core Online</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
