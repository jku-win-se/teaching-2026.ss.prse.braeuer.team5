import "./ToggleSwitch.css";

type ToggleSwitchProps = {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
  ariaLabel?: string;
};

export function ToggleSwitch({ isOn, onChange, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      className={`toggle-switch ${isOn ? "on" : "off"}`}
      onClick={() => onChange(!isOn)}
      aria-label={ariaLabel || "Toggle switch"}
      role="switch"
      aria-checked={isOn}
    >
      <div className="toggle-thumb" />
    </button>
  );
}
