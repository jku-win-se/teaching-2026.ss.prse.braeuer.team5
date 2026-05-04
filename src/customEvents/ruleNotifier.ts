type RuleListener = (ruleName: string) => void;

class RuleNotifier {
  private listeners: RuleListener[] = [];

  subscribe(fn: RuleListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  emit(ruleName: string): void {
    this.listeners.forEach((fn) => fn(ruleName));
  }
}

export const ruleNotifier = new RuleNotifier();
