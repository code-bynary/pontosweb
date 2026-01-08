import { useState } from 'react';
import { updateWorkday } from '../services/api';
import StatusBadge from './StatusBadge';

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
