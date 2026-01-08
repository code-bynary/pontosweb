import { useState } from 'react';
import { updateEmployeeSchedule } from '../services/api';

export default function EditScheduleModal({ isOpen, onClose, employee, onUpdate }) {
    const [schedule, setSchedule] = useState({
        workStart1: employee.workStart1 || '08:00',
        workEnd1: employee.workEnd1 || '12:00',
        workStart2: employee.workStart2 || '13:00',
        workEnd2: employee.workEnd2 || '17:48'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await updateEmployeeSchedule(employee.id, schedule);
            onUpdate();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao atualizar horário');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        Configurar Horário Padrão
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        ✕
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Defina o horário de trabalho para <strong>{employee.name}</strong>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrada 1</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={schedule.workStart1}
                                onChange={(e) => setSchedule({ ...schedule, workStart1: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Saída 1</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={schedule.workEnd1}
                                onChange={(e) => setSchedule({ ...schedule, workEnd1: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Entrada 2</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={schedule.workStart2}
                                onChange={(e) => setSchedule({ ...schedule, workStart2: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Saída 2</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={schedule.workEnd2}
                                onChange={(e) => setSchedule({ ...schedule, workEnd2: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Horário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
