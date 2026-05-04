import React, { useEffect, useState } from 'react';
import { LucideCheck } from 'lucide-react';
import { ruleNotifier } from '../customEvents/ruleNotifier';
import './RuleToast.css';

interface Toast {
  id: number;
  ruleName: string;
  leaving: boolean;
}

const DISPLAY_MS = 3500;
const LEAVE_MS   = 300;

export const RuleToast: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return ruleNotifier.subscribe((ruleName) => {
      const id = Date.now();

      setToasts((prev) => [...prev, { id, ruleName, leaving: false }]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, LEAVE_MS);
      }, DISPLAY_MS);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="rule-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`rule-toast${t.leaving ? ' toast-leaving' : ''}`}>
          <span className="rule-toast-icon">
            <LucideCheck size={13} strokeWidth={3} />
          </span>
          Regel &quot;{t.ruleName}&quot; erfolgreich ausgeführt
        </div>
      ))}
    </div>
  );
};
