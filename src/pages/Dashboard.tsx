import { isSupabaseConfigured } from "../config/supabaseClient";

type DeviceCard = {
  id: number;
  name: string;
  room: string;
  status: string;
};

const sampleDevices: DeviceCard[] = [
  { id: 1, name: "Wohnzimmerlampe", room: "Wohnzimmer", status: "An" },
  { id: 2, name: "Fenstersensor", room: "Kueche", status: "Geschlossen" },
  { id: 3, name: "Thermostat", room: "Schlafzimmer", status: "21 C" },
];

const statusMessage = isSupabaseConfigured
  ? "Supabase-Umgebung erkannt. Datenanbindung kann aktiviert werden."
  : "Noch keine Supabase-Variablen gesetzt. Es werden Platzhalterdaten angezeigt.";

export default function Dashboard() {
  return (
    <section>
      <h2>Dashboard</h2>
      <p>{statusMessage}</p>

      <div>
        {sampleDevices.map((device) => (
          <article key={device.id}>
            <h3>{device.name}</h3>
            <p>Raum: {device.room}</p>
            <p>Status: {device.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
