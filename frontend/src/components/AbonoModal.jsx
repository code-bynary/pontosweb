import { useState } from 'react';
import { createAbono, uploadAbonoDocument, deleteAbono } from '../services/api';

export default function AbonoModal({ workday, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        type: 'FULL_DAY',
        reason: 'Atestado Médico',
        startTime: '',
        endTime: '',
        minutes: workday.expectedMinutes,
        customReason: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTypeChange = (type) => {
        setFormData({
            ...formData,
            type,
            minutes: type === 'FULL_DAY' ? workday.expectedMinutes : 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create abono
            const abono = await createAbono({
                workdayId: workday.id,
                type: formData.type,
                reason: formData.reason === 'Outro' ? formData.customReason : formData.reason,
                startTime: formData.startTime || null,
                endTime: formData.endTime || null,
                minutes: parseInt(formData.minutes)
            });

            // Upload document if provided
            if (file) {
                await uploadAbonoDocument(abono.id, file);
            }

            alert('Abono cadastrado com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Erro ao cadastrar abono: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!workday.abono) return;

        if (!window.confirm('Deseja realmente remover este abono?')) {
            return;
        }

        setLoading(true);
        try {
            await deleteAbono(workday.abono.id);
            alert('Abono removido com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('Erro ao remover abono: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {workday.abono ? 'Gerenciar Abono' : 'Abonar Dia'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {workday.abono ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Tipo</p>
                            <p className="font-semibold">
                                {workday.abono.type === 'FULL_DAY' ? 'Dia Completo' : 'Parcial'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Motivo</p>
                            <p className="font-semibold">{workday.abono.reason}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Horas Abonadas</p>
                            <p className="font-semibold">{workday.abonoMinutes} minutos</p>
                        </div>
                        {workday.abono.document && (
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Documento</p>
                                <button
                                    onClick={() => window.open(`/api/abonos/workday/${workday.id}/download`, '_blank')}
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    📎 Baixar Atestado
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Removendo...' : 'Remover Abono'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Abono *
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.type === 'FULL_DAY'}
                                        onChange={() => handleTypeChange('FULL_DAY')}
                                        className="mr-2"
                                    />
                                    <span>Dia Completo (abona {workday.expectedMinutes} min)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.type === 'PARTIAL'}
                                        onChange={() => handleTypeChange('PARTIAL')}
                                        className="mr-2"
                                    />
                                    <span>Parcial (especificar horas)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo *
                            </label>
                            <select
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="Atestado Médico">Atestado Médico</option>
                                <option value="Atestado Odontológico">Atestado Odontológico</option>
                                <option value="Atestado Psicológico">Atestado Psicológico</option>
                                <option value="Declaração de Comparecimento">Declaração de Comparecimento</option>
                                <option value="Folga Compensatória">Folga Compensatória</option>
                                <option value="Outro">Outro (Especificar)</option>
                            </select>
                        </div>

                        {formData.reason === 'Outro' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Especifique o Motivo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.customReason}
                                    onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Treinamento Externo"
                                    required
                                />
                            </div>
                        )}

                        {formData.type === 'PARTIAL' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minutos a Abonar *
                                </label>
                                <input
                                    type="number"
                                    value={formData.minutes}
                                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                                    min="0"
                                    max={workday.expectedMinutes}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Máximo: {workday.expectedMinutes} minutos
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Anexar Atestado (opcional)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Salvando...' : 'Salvar Abono'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
