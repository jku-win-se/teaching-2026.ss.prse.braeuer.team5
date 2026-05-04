import React, { useEffect, useRef, useState } from 'react';
import { ruleNotifier } from '../customEvents/ruleNotifier';
import { LucideZap, LucideX } from 'lucide-react';
import './RuleActionOverlay.css';

export const RuleActionOverlay: React.FC = () => {
  const [triggeredRule, setTriggeredRule] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const unsubscribe = ruleNotifier.subscribe((ruleName) => {
            setTriggeredRule(ruleName);

            // 1. alten Timer stoppen
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // 2. neuen Timer starten
            timeoutRef.current = setTimeout(() => {
                setTriggeredRule(null);
            }, 5000);
        });

        return () => {
            unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

  if (!triggeredRule) return null;

  return (
    <div className="rule-overlay-container">
      <div className="rule-overlay-card">
        <div className="rule-overlay-header">
          <LucideZap size={20} />
          <span>Regel ausgelöst!</span>
          <button onClick={() => setTriggeredRule(null)} className="close-btn">
            <LucideX size={18} />
          </button>
        </div>
        <div className="rule-overlay-body">
          <strong>{triggeredRule}</strong> wurde gerade ausgeführt.
        </div>
      </div>
    </div>
  );
};