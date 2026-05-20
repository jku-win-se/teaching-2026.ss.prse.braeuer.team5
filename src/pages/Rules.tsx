import React, { useState, useMemo } from 'react';
import { useRules } from '../hooks/useRules';
import { useSchedules } from '../hooks/useSchedules';
import { useRooms } from '../hooks/useRooms';
import { ruleService } from '../services/ruleService';
import { detectRuleConflicts } from '../services/conflictService';
import { LucidePlus } from 'lucide-react';
import type { Conflict, Rule, DeviceWithRoom } from '../types';
import { DeleteModal } from '../components/modals/DeleteModal';
import { RuleList } from '../components/rules/RuleList';
import { RuleFormModal } from '../components/rules/RuleFormModal';
import {
  type ConditionField,
  emptyForm,
  type RuleFormData,
  FIELD_OPTIONS,
  isBoolField,
  isStringField,
  getDefaultConditionValue,
  getDefaultActionState,
} from '../components/rules/ruleUtils';
import '../components/schedule/Schedules.css';
import './Rules.css';

export const Rules: React.FC = () => {
  const { rules, devices, loading, refresh, toggleRuleLocal } = useRules();
  const { schedules } = useSchedules();
  const { rooms } = useRooms();
  const ownerRoomIds = useMemo(
    () => new Set(rooms.filter((r) => r.role === 'owner').map((r) => r.id)),
    [rooms]
  );
  const canManageRule = (rule: Rule) => ownerRoomIds.has(rule.room_id ?? '');
  const canAddRules = ownerRoomIds.size > 0;

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [formData, setFormData] = useState<RuleFormData>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const groupedDevices = useMemo(() => {
    return devices
      .filter((d) => ownerRoomIds.has(d.room_id))
      .reduce((acc: Record<string, DeviceWithRoom[]>, device) => {
        const roomName = device.rooms?.name || 'Unbekannter Raum';
        if (!acc[roomName]) acc[roomName] = [];
        acc[roomName].push(device);
        return acc;
      }, {});
  }, [devices, ownerRoomIds]);

  const triggerDeviceType = useMemo(() => {
    const dev = devices.find((d) => d.id === formData.device_id);
    return dev?.type?.trim() || '';
  }, [formData.device_id, devices]);

  const actionDeviceType = useMemo(() => {
    const dev = devices.find((d) => d.id === formData.action.device_id);
    return dev?.type?.trim() || '';
  }, [formData.action.device_id, devices]);

  const openNewModal = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setSaveError(null);
    setConflicts([]);
    setShowModal(true);
  };

  const openEditModal = (rule: Rule) => {
    setEditingId(rule.id);
    setFormData({
      name: rule.name,
      room_id: rule.room_id ?? '',
      device_id: rule.device_id,
      condition: rule.condition,
      action: rule.action,
    });
    setSaveError(null);
    setConflicts([]);
    setShowModal(true);
  };

  const handleTriggerDeviceChange = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const type = dev?.type?.trim() || '';
    const fields = FIELD_OPTIONS[type] ?? [{ field: 'on' as ConditionField, label: 'Ein/Aus' }];
    const firstField = fields[0].field;
    setFormData((prev) => ({
      ...prev,
      device_id: deviceId,
      room_id: dev?.room_id || '',
      condition: {
        field: firstField,
        operator: isBoolField(firstField) || isStringField(firstField) ? '==' : '>',
        value: getDefaultConditionValue(firstField),
      },
    }));
  };

  const handleActionDeviceChange = (deviceId: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    const type = dev?.type?.trim() || '';
    setFormData((prev) => ({
      ...prev,
      action: {
        device_id: deviceId,
        state: getDefaultActionState(type),
      },
    }));
  };

  const handleConditionFieldChange = (field: ConditionField) => {
    setFormData((prev) => ({
      ...prev,
      condition: {
        field,
        operator: isBoolField(field) || isStringField(field) ? '==' : '>',
        value: getDefaultConditionValue(field),
      },
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    if (conflicts.length === 0) {
      const found = detectRuleConflicts(
        {
          id: editingId ?? undefined,
          device_id: formData.device_id,
          condition: formData.condition,
          action: formData.action,
        },
        rules,
        schedules,
      );
      if (found.length > 0) {
        setConflicts(found);
        return;
      }
    }
    setConflicts([]);
    try {
      if (editingId) {
        await ruleService.updateRule(editingId, formData);
      } else {
        await ruleService.createRule(formData);
      }
      setShowModal(false);
      refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? 'Unbekannter Fehler beim Speichern.');
    }
  };

  if (loading) return <div className="loading">Lade...</div>;

  return (
    <div className="schedules-container">
      <div className="schedules-header">
        <h1>Regeln</h1>
        {canAddRules && (
          <button className="add-btn" onClick={openNewModal}>
            <LucidePlus size={18} /> Neue Regel
          </button>
        )}
      </div>

      <RuleList
        rules={rules}
        devices={devices}
        onEdit={openEditModal}
        onDelete={(id) => {
          const rule = rules.find((r) => r.id === id);
          setDeleteTarget({ id, name: rule?.name ?? 'Regel' });
        }}
        onToggle={(rule) => {
          const newValue = !rule.is_active;
          ruleService.toggleRule(rule.id, newValue).then(() => toggleRuleLocal(rule.id, newValue));
        }}
        canManage={canManageRule}
      />

      <DeleteModal
        itemName={deleteTarget?.name ?? null}
        itemType="Regel"
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await ruleService.deleteRule(deleteTarget.id);
            setDeleteTarget(null);
            refresh();
          }
        }}
      />

      {showModal && (
        <RuleFormModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          groupedDevices={groupedDevices}
          triggerDeviceType={triggerDeviceType}
          actionDeviceType={actionDeviceType}
          onTriggerDeviceChange={handleTriggerDeviceChange}
          onActionDeviceChange={handleActionDeviceChange}
          onConditionFieldChange={handleConditionFieldChange}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saveError={saveError}
          conflicts={conflicts}
        />
      )}
    </div>
  );
};
