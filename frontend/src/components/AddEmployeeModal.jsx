import { useState } from 'react';

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        enNo: '',
        name: '',
        workStart1: '08:00',
        workEnd1: '12:00',
        workStart2: '13:00',
        workEnd2: '17:48'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao cadastrar funcionário.');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-primary-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-black">Novo Colaborador</h2>
                    <p className="text-primary-100 text-sm mt-1">Cadastro manual para gestão interna</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 italic">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Matrícula / ID</label>
                            <input
                                required
                                type="text"
                                placeholder="Ex: 001"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                value={formData.enNo}
                                onChange={(e) => setFormData({ ...formData, enNo: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                            <input
                                required
                                type="text"
                                placeholder="Nome do colaborador"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Entrada 1</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    value={formData.workStart1}
                                    onChange={(e) => setFormData({ ...formData, workStart1: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Saída 1</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    value={formData.workEnd1}
                                    onChange={(e) => setFormData({ ...formData, workEnd1: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Entrada 2</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    value={formData.workStart2}
                                    onChange={(e) => setFormData({ ...formData, workStart2: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Saída 2</label>
                                <input
                                    type="time"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                    value={formData.workEnd2}
                                    onChange={(e) => setFormData({ ...formData, workEnd2: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-100 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Cadastrando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
