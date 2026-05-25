import { MqttSettings } from "../components/mqtt/MqttSettings";

export default function MqttSettingsPage() {
  return (
    <div className="page-shell">
      <main className="content-area">
        <MqttSettings />
      </main>
    </div>
  );
}
