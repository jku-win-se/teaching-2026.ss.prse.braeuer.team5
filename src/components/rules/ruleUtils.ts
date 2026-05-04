import type { TriggerOperator, DeviceState } from '../../types';

export type ConditionField = keyof DeviceState;

export const FIELD_OPTIONS: Record<string, { field: ConditionField; label: string }[]> = {
  Thermostat: [{ field: 'temperature', label: 'Temperatur (°C)' }],
  Dimmer:     [{ field: 'brightness', label: 'Helligkeit (%)' }, { field: 'on', label: 'Ein/Aus' }],
  Schalter:   [{ field: 'on', label: 'Ein/Aus' }],
  Sensor:     [{ field: 'on', label: 'Aktiv' }, { field: 'value', label: 'Wert' }],
  Jalousie:   [{ field: 'position', label: 'Position' }],
};

export const NUMERIC_OPERATORS: TriggerOperator[] = ['==', '!=', '>', '>=', '<', '<='];
export const BOOL_OPERATORS: TriggerOperator[] = ['==', '!='];

export const isBoolField = (field: ConditionField): boolean => field === 'on';
export const isStringField = (field: ConditionField): boolean =>
  field === 'position' || field === 'value';

export const getDefaultConditionValue = (field: ConditionField): boolean | number | string => {
  if (field === 'on') return true;
  if (field === 'temperature') return 25;
  if (field === 'brightness') return 80;
  if (field === 'position') return 'offen';
  return '';
};

export const getDefaultActionState = (type: string): DeviceState => {
  if (type === 'Thermostat') return { temperature: 21 };
  if (type === 'Dimmer')     return { brightness: 0 };
  if (type === 'Jalousie')   return { position: 'geschlossen' };
  return { on: false };
};

export const emptyForm = () => ({
  name: '',
  room_id: '',
  device_id: '',
  condition: {
    field: 'on' as ConditionField,
    operator: '==' as TriggerOperator,
    value: true as boolean | number | string,
  },
  action: {
    device_id: '',
    state: { on: false } as DeviceState,
  },
});

export type RuleFormData = ReturnType<typeof emptyForm>;
