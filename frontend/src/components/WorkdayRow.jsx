import { useState } from 'react';
import { updateWorkday } from '../services/api';
import StatusBadge from './StatusBadge';

const formatMinutes = (total) => {
    if (total === undefined || total === null || isNaN(total)) return '00:00';
    const absolute = Math.abs(total);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;
    const sign = total < 0 ? '-' : '';
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export default function WorkdayRow({ workday, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [values, setValues] = useState({
        entrada1: workday.entrada1 || '',
        saida1: workday.saida1 || '',
        entrada2: workday.entrada2 || '',
        saida2: workday.saida2 || ''
    });
    const [saving, setSaving] = useState(false);

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setValues({
            entrada1: workday.entrada1 || '',
            saida1: workday.saida1 || '',
            entrada2: workday.entrada2 || '',
            saida2: workday.saida2 || ''
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateWorkday(workday.id, {
                ...values,
                reason: 'Ajuste manual via interface'
            });
            setEditing(false);
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            alert('Erro ao salvar alterações: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    return (
        <tr className={editing ? 'bg-blue-50' : ''}>
            <td className="font-medium">{workday.date}</td>
            <td>
                {editing ? (
                    <input
                        type="time"
                        value={values.entrada1}
                        onChange={(e) => handleChange('entrada1', e.target.value)}
                        className="input text-sm py-1"
                    />
                ) : (
                    workday.entrada1 || '-'
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        type="time"
                        value={values.saida1}
                        onChange={(e) => handleChange('saida1', e.target.value)}
                        className="input text-sm py-1"
                    />
                ) : (
                    workday.saida1 || '-'
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        type="time"
                        value={values.entrada2}
                        onChange={(e) => handleChange('entrada2', e.target.value)}
                        className="input text-sm py-1"
                    />
                ) : (
                    workday.entrada2 || '-'
                )}
            </td>
            <td>
                {editing ? (
                    <input
                        type="time"
                        value={values.saida2}
                        onChange={(e) => handleChange('saida2', e.target.value)}
                        className="input text-sm py-1"
                    />
                ) : (
                    workday.saida2 || '-'
                )}
            </td>
            <td className="font-medium">{workday.totalHours}</td>
            <td className="text-gray-600 text-sm">
                {formatMinutes(workday.expectedMinutes)}
            </td>
            <td className={workday.extraMinutes > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {workday.extraMinutes > 0 ? `+${formatMinutes(workday.extraMinutes)}` : '-'}
            </td>
            <td className={`font-bold ${workday.balanceMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {workday.balanceMinutes > 0 ? '+' : ''}{formatMinutes(workday.balanceMinutes)}
            </td>
            <td>
                <StatusBadge status={workday.status} />
            </td>
            <td>
                {editing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary text-xs px-2 py-1"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="btn btn-secondary text-xs px-2 py-1"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="btn btn-secondary text-xs px-2 py-1"
                    >
                        Editar
                    </button>
                )}
            </td>
        </tr>
    );
}
