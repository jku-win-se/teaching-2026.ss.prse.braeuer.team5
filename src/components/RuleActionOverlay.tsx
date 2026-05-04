import React, { useEffect, useState } from 'react';
import { ruleNotifier } from '../customEvents/ruleNotifier';
import { LucideZap, LucideX } from 'lucide-react';
import './RuleActionOverlay.css';

export const RuleActionOverlay: React.FC = () => {
  const [triggeredRule, setTriggeredRule] = useState<string | null>(null);

  useEffect(() => {
    // Wir abonnieren den Service
    const unsubscribe = ruleNotifier.subscribe((ruleName) => {
      setTriggeredRule(ruleName);

      // Optional: Overlay nach 5 Sekunden automatisch ausblenden
      setTimeout(() => setTriggeredRule(null), 5000);
    });

    // Cleanup beim Unmount (WICHTIG!)
    return () => unsubscribe();
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