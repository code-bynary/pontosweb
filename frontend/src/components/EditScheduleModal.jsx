import { useState } from 'react';
import { Dialog } from '@headlessui/react';
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

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-bold mb-4">
                        Configurar Horário Padrão
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mb-6">
                        Defina o horário de trabalho para <strong>{employee.name}</strong>.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Entrada 1</label>
                                <input
                                    type="time"
                                    className="input mt-1"
                                    value={schedule.workStart1}
                                    onChange={(e) => setSchedule({ ...schedule, workStart1: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Saída 1</label>
                                <input
                                    type="time"
                                    className="input mt-1"
                                    value={schedule.workEnd1}
                                    onChange={(e) => setSchedule({ ...schedule, workEnd1: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Entrada 2</label>
                                <input
                                    type="time"
                                    className="input mt-1"
                                    value={schedule.workStart2}
                                    onChange={(e) => setSchedule({ ...schedule, workStart2: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Saída 2</label>
                                <input
                                    type="time"
                                    className="input mt-1"
                                    value={schedule.workEnd2}
                                    onChange={(e) => setSchedule({ ...schedule, workEnd2: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Horário'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
