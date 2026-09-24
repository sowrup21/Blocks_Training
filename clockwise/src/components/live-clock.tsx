import { useState, useEffect } from 'react';

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <span className="font-mono text-3xl font-bold tracking-wide text-slate-900 sm:text-4xl">
      {time}
    </span>
  );
}
