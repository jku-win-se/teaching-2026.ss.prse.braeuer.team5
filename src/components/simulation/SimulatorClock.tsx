const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DAY_NAMES_FULL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const HOUR_LABELS = [0, 6, 12, 18, 24];

type Props = {
  simTick: number;
  totalMinutes: number;
  mode: "day" | "week";
  selectedDay: number;
};

function padTwo(n: number) {
  return n.toString().padStart(2, "0");
}

function DayTimeline({ simTick, selectedDay }: { simTick: number; selectedDay: number }) {
  const minuteOfDay = simTick % 1440;
  const progress = minuteOfDay / 1440;
  const hours = Math.floor(minuteOfDay / 60);
  const mins = minuteOfDay % 60;

  return (
    <div className="sim-timeline-wrapper">
      <div className="sim-timeline-header">
        <span className="sim-timeline-dayname">{DAY_NAMES_FULL[selectedDay]}</span>
        <span className="sim-timeline-time">{padTwo(hours)}:{padTwo(mins)}</span>
      </div>

      <div className="sim-timeline-bar-container">
        <div
          className="sim-timeline-fill"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="sim-timeline-cursor"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      <div className="sim-timeline-labels">
        {HOUR_LABELS.map((h) => (
          <span
            key={h}
            className="sim-timeline-label"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {padTwo(h)}:00
          </span>
        ))}
      </div>
    </div>
  );
}

function WeekTimeline({ simTick }: { simTick: number }) {
  const currentDayIndex = Math.min(Math.floor(simTick / 1440), 6);
  const dayFraction = (simTick % 1440) / 1440;
  const minuteOfDay = simTick % 1440;
  const hours = Math.floor(minuteOfDay / 60);
  const mins = minuteOfDay % 60;

  return (
    <div className="sim-timeline-wrapper">
      <div className="sim-timeline-header">
        <span className="sim-timeline-dayname">{DAY_NAMES_FULL[currentDayIndex % 7]}</span>
        <span className="sim-timeline-time">{padTwo(hours)}:{padTwo(mins)}</span>
      </div>

      <div className="sim-week-segments">
        {DAY_NAMES.map((name, i) => {
          const isPast = i < currentDayIndex;
          const isCurrent = i === currentDayIndex;
          const fillPct = isPast ? 100 : isCurrent ? dayFraction * 100 : 0;

          return (
            <div
              key={name}
              className={`sim-week-segment${isCurrent ? " sim-week-segment-active" : ""}${isPast ? " sim-week-segment-past" : ""}`}
            >
              <span className="sim-week-segment-label">{name}</span>
              <div className="sim-week-segment-bar">
                <div
                  className="sim-week-segment-fill"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SimulatorClock({ simTick, mode, selectedDay }: Props) {
  if (mode === "week") {
    return <WeekTimeline simTick={simTick} />;
  }
  return <DayTimeline simTick={simTick} selectedDay={selectedDay} />;
}
