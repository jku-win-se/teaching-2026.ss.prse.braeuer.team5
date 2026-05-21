import { useCallback, useEffect, useRef, useState } from "react";
import type { DeviceState, Schedule } from "../types";
import { simulationService, type SimDevice } from "../services/simulationService";
import { SimulatorControls } from "../components/simulation/SimulatorControls";
import { SimulatorClock } from "../components/simulation/SimulatorClock";
import { SimulatorRoomGroup } from "../components/simulation/SimulatorRoomGroup";
import "../components/simulation/Simulator.css";

const TICK_INTERVAL_MS = 100;
const HIGHLIGHT_DURATION_MS = 2000;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function Simulator() {
  const [mode, setMode] = useState<"day" | "week">("day");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [speedStep, setSpeedStep] = useState<number>(5);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simTick, setSimTick] = useState(0);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<SimDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const [simStates, setSimStates] = useState<Map<string, DeviceState>>(new Map());
  const [changedDevices, setChangedDevices] = useState<Set<string>>(new Set());

  const initialStatesRef = useRef<Map<string, DeviceState>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);
  const speedRef = useRef(speedStep);
  const schedulesRef = useRef<Schedule[]>([]);
  const modeRef = useRef(mode);
  const selectedDayRef = useRef(selectedDay);

  speedRef.current = speedStep;
  schedulesRef.current = schedules;
  modeRef.current = mode;
  selectedDayRef.current = selectedDay;

  const totalMinutes = mode === "week" ? 7 * 1440 : 1440;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sched, devices] = await Promise.all([
          simulationService.fetchSimulationSchedules(),
          simulationService.fetchSimulationDevices(),
        ]);
        setSchedules(sched);
        setDevices(devices);

        const initMap = new Map<string, DeviceState>();
        for (const d of devices) {
          initMap.set(d.id, d.state ?? {});
        }
        initialStatesRef.current = initMap;
        setSimStates(new Map(initMap));
      } catch (err) {
        console.error("Simulation data load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const processTick = useCallback((nextTick: number) => {
    const currentMode = modeRef.current;
    const currentSelectedDay = selectedDayRef.current;
    const minuteOfDay = nextTick % 1440;
    const dayOffset = Math.floor(nextTick / 1440);
    const dayNumber = currentMode === "week" ? dayOffset % 7 : currentSelectedDay;

    const fired: string[] = [];
    for (const s of schedulesRef.current) {
      if (!s.days.includes(dayNumber)) continue;
      if (timeToMinutes(s.time) !== minuteOfDay) continue;
      fired.push(s.device_id);

      // Update device state according to schedule action

      setSimStates((prev) => {
        const next = new Map(prev);
        next.set(s.device_id, s.action_value);
        return next;
      });
    }


    //Highlight devices that changed state
    if (fired.length > 0) {
      setChangedDevices((prev) => {
        const next = new Set(prev);
        for (const id of fired) next.add(id);
        return next;
      });
      setTimeout(() => {
        setChangedDevices((prev) => {
          const next = new Set(prev);
          for (const id of fired) next.delete(id);
          return next;
        });
      }, HIGHLIGHT_DURATION_MS);
    }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      const total = modeRef.current === "week" ? 7 * 1440 : 1440;
      const prevTick = tickRef.current;
      const rawNext = prevTick + speedRef.current;
      const isDone = rawNext >= total;
      const nextTick = isDone ? total - 1 : rawNext;

      // Iterate every skipped minute so no schedule is missed regardless of speed
      for (let t = prevTick + 1; t <= nextTick; t++) {
        processTick(t);
      }

      tickRef.current = nextTick;
      setSimTick(nextTick);

      if (isDone) {
        setIsRunning(false);
        setIsPaused(false);
        stopInterval();
      }
    }, TICK_INTERVAL_MS);
  }, [stopInterval, processTick]);

  const handleStart = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      startInterval();
      return;
    }
    tickRef.current = 0;
    setSimTick(0);
    setSimStates(new Map(initialStatesRef.current));
    setChangedDevices(new Set());
    setIsRunning(true);
    setIsPaused(false);
    startInterval();
  }, [isPaused, startInterval]);

  const handlePause = useCallback(() => {
    stopInterval();
    setIsPaused(true);
    setIsRunning(false);
  }, [stopInterval]);

  const handleStop = useCallback(() => {
    stopInterval();
    tickRef.current = 0;
    setSimTick(0);
    setIsRunning(false);
    setIsPaused(false);
    setSimStates(new Map(initialStatesRef.current));
    setChangedDevices(new Set());
  }, [stopInterval]);

  useEffect(() => () => stopInterval(), [stopInterval]);

  // Group devices by room
  const roomMap = new Map<string, { roomName: string; devices: SimDevice[] }>();
  for (const d of devices) {
    const roomName = d.rooms?.name ?? "Unbekannter Raum";
    if (!roomMap.has(d.room_id)) {
      roomMap.set(d.room_id, { roomName, devices: [] });
    }
    roomMap.get(d.room_id)!.devices.push(d);
  }
  const roomGroups = Array.from(roomMap.values());

  return (
    <section className="simulator-page">
      <h2>Simulator</h2>

      <SimulatorControls
        mode={mode}
        selectedDay={selectedDay}
        speedStep={speedStep}
        isRunning={isRunning}
        isPaused={isPaused}
        onModeChange={(m) => { setMode(m); handleStop(); }}
        onDayChange={(d) => { setSelectedDay(d); handleStop(); }}
        onSpeedChange={setSpeedStep}
        onStart={handleStart}
        onPause={handlePause}
        onStop={handleStop}
      />

      <div className="sim-status-bar">
        {isRunning || isPaused || simTick > 0 ? (
          <SimulatorClock
            simTick={simTick}
            totalMinutes={totalMinutes}
            mode={mode}
            selectedDay={selectedDay}
          />
        ) : (
          <p className="sim-status-idle">
            Simulation bereit. Wähle Modus und Geschwindigkeit, dann klicke "Starten".
          </p>
        )}
      </div>

      {loading ? (
        <p className="sim-empty">Lade Daten…</p>
      ) : devices.length === 0 ? (
        <p className="sim-empty">Keine Geräte gefunden.</p>
      ) : (
        <div className="sim-rooms">
          {roomGroups.map(({ roomName, devices: roomDevices }) => (
            <SimulatorRoomGroup
              key={roomName}
              roomName={roomName}
              devices={roomDevices}
              simStates={simStates}
              changedDevices={changedDevices}
            />
          ))}
        </div>
      )}
    </section>
  );
}
