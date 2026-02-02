import { useState, useEffect } from 'react';
import { getHolidays, createHoliday, deleteHoliday } from '../services/api';

export default function HolidaysPage() {
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
        className = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
                            <option value="NATIONAL">Nacional</option>
                            <option value="MUNICIPAL">Municipal</option>
                            <option value="COMPENSATORY">Compensado</option>
                        </select >
                    </div >

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição (opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Feriado nacional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Cadastrar Feriado
                        </button>
                    </div>
                </form >
            </div >

        {/* Filtro por Ano */ }
        < div className = "bg-white rounded-lg shadow-md p-4 mb-6" >
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por ano:</label>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            </div >

        {/* Lista de Feriados */ }
        < div className = "bg-white rounded-lg shadow-md overflow-hidden" >
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                    Feriados de {selectedYear}
                </h2>
            </div>

    {
        loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : holidays.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                Nenhum feriado cadastrado para {selectedYear}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {holidays.map((holiday) => (
                            <tr key={holiday.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(holiday.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {holiday.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(holiday.type)}`}>
                                        {getTypeLabel(holiday.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {holiday.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleDelete(holiday.id)}
                                        className="text-red-600 hover:text-red-900 font-medium"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
            </div >
        </div >
    );
}
