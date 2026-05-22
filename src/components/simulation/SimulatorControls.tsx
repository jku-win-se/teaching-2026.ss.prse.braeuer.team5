const DAY_OPTIONS = [
  { value: 0, label: "Montag" },
  { value: 1, label: "Dienstag" },
  { value: 2, label: "Mittwoch" },
  { value: 3, label: "Donnerstag" },
  { value: 4, label: "Freitag" },
  { value: 5, label: "Samstag" },
  { value: 6, label: "Sonntag" },
];

const SPEED_OPTIONS = [
  { label: "Langsam (1 min/Tick)", step: 1 },
  { label: "Normal (5 min/Tick)", step: 5 },
  { label: "Schnell (15 min/Tick)", step: 15 },
  { label: "Turbo (60 min/Tick)", step: 60 },
];

type Props = {
  mode: "day" | "week";
  selectedDay: number;
  speedStep: number;
  isRunning: boolean;
  isPaused: boolean;
  onModeChange: (mode: "day" | "week") => void;
  onDayChange: (day: number) => void;
  onSpeedChange: (step: number) => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
};

export function SimulatorControls({
  mode,
  selectedDay,
  speedStep,
  isRunning,
  isPaused,
  onModeChange,
  onDayChange,
  onSpeedChange,
  onStart,
  onPause,
  onStop,
}: Props) {
  return (
    <div className="sim-controls">
      <div className="sim-mode-group">
        <label htmlFor="sim-mode">Modus:</label>
        <select
          id="sim-mode"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as "day" | "week")}
          disabled={isRunning && !isPaused}
        >
          <option value="day">Einzelner Tag</option>
          <option value="week">Gesamte Woche</option>
        </select>
      </div>

      {mode === "day" && (
        <div className="sim-mode-group">
          <label htmlFor="sim-day">Tag:</label>
          <select
            id="sim-day"
            value={selectedDay}
            onChange={(e) => onDayChange(Number(e.target.value))}
            disabled={isRunning && !isPaused}
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="sim-speed-group">
        <label htmlFor="sim-speed">Geschwindigkeit:</label>
        <select
          id="sim-speed"
          value={speedStep}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s.step} value={s.step}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="sim-btn-group">
        {!isRunning || isPaused ? (
          <button className="sim-btn sim-btn-start" onClick={onStart}>
            {isPaused ? "Fortsetzen" : "Starten"}
          </button>
        ) : (
          <button className="sim-btn sim-btn-pause" onClick={onPause}>Pause</button>
        )}
        <button className="sim-btn sim-btn-stop" onClick={onStop} disabled={!isRunning && !isPaused}>
          Stop / Reset
        </button>
      </div>
    </div>
  );
}
