import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHolidays, createHoliday, deleteHoliday } from '../services/api';
import Header from '../components/Header';

export default function HolidaysPage() {
    const navigate = useNavigate();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        type: 'NATIONAL',
        description: ''
    });

    useEffect(() => {
        loadHolidays();
    }, [selectedYear]);

    const loadHolidays = async () => {
        setLoading(true);
        try {
            const data = await getHolidays(selectedYear);
            setHolidays(data);
        } catch (error) {
            alert('Erro ao carregar feriados: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.name) {
            alert('Data e nome são obrigatórios');
            return;
        }

        try {
            await createHoliday(formData);
            setFormData({ date: '', name: '', type: 'NATIONAL', description: '' });
            await loadHolidays();
            alert('Feriado cadastrado com sucesso!');
        } catch (error) {
            alert('Erro ao cadastrar feriado: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja realmente excluir este feriado?')) {
            return;
        }

        try {
            await deleteHoliday(id);
            await loadHolidays();
            alert('Feriado excluído com sucesso!');
        } catch (error) {
            alert('Erro ao excluir feriado: ' + (error.response?.data?.error || error.message));
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            NATIONAL: 'Nacional',
            MUNICIPAL: 'Municipal',
            COMPENSATORY: 'Compensado'
        };
        return labels[type] || type;
    };

    const getTypeBadgeClass = (type) => {
        const classes = {
            NATIONAL: 'bg-blue-100 text-blue-800',
            MUNICIPAL: 'bg-green-100 text-green-800',
            COMPENSATORY: 'bg-yellow-100 text-yellow-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Gerenciar Feriados"
                subtitle="Configure feriados nacionais, municipais e pontes"
                onBack="/"
            />

            <div className="max-w-7xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lateral: Formulário e Filtro */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastrar Novo</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Ano Novo"
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="input"
                                    >
                                        <option value="NATIONAL">Nacional</option>
                                        <option value="MUNICIPAL">Municipal</option>
                                        <option value="COMPENSATORY">Compensado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input h-20"
                                        placeholder="Opcional..."
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    Salvar Feriado
                                </button>
                            </form>
                        </div>

                        <div className="card">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Ano</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="input"
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Principal: Lista de Feriados */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Feriados de {selectedYear}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {holidays.length} cadastrados
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <p className="text-gray-500">Carregando...</p>
                            </div>
                        ) : holidays.length === 0 ? (
                            <div className="card text-center py-12 bg-gray-50 border-dashed border-2">
                                <p className="text-gray-500">Nenhum feriado cadastrado para este ano.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {holidays.map((holiday) => (
                                    <div key={holiday.id} className="card hover:shadow-lg transition-shadow relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getTypeBadgeClass(holiday.type)}`}>
                                                {getTypeLabel(holiday.type)}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(holiday.id)}
                                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{holiday.name}</h3>
                                        <p className="text-primary-600 font-medium mb-2">
                                            {formatDate(holiday.date)}
                                        </p>
                                        {holiday.description && (
                                            <p className="text-sm text-gray-600 italic">
                                                "{holiday.description}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
