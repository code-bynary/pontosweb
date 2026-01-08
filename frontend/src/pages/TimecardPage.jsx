import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMonthlyTimecard, downloadPDF, downloadExcel } from '../services/api';
import WorkdayRow from '../components/WorkdayRow';
import { format, addMonths, subMonths } from 'date-fns';

export default function TimecardPage() {
    const { employeeId, month } = useParams();
    const navigate = useNavigate();
    const [timecard, setTimecard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTimecard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMonthlyTimecard(employeeId, month);
            setTimecard(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao carregar cartão de ponto');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTimecard();
    }, [employeeId, month]);

    const handlePreviousMonth = () => {
        const [year, monthNum] = month.split('-').map(Number);
        const date = new Date(year, monthNum - 1, 1);
        const prevMonth = format(subMonths(date, 1), 'yyyy-MM');
        navigate(`/timecard/${employeeId}/${prevMonth}`);
    };

    const handleNextMonth = () => {
        const [year, monthNum] = month.split('-').map(Number);
        const date = new Date(year, monthNum - 1, 1);
        const nextMonth = format(addMonths(date, 1), 'yyyy-MM');
        navigate(`/timecard/${employeeId}/${nextMonth}`);
    };

    const handleDownloadPDF = () => {
        downloadPDF(employeeId, month);
    };

    const handleDownloadExcel = () => {
        downloadExcel(employeeId, month);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Carregando cartão de ponto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card max-w-md">
                    <p className="text-red-600">{error}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-primary-600 hover:text-primary-700 mb-2"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-3xl font-bold text-primary-600">
                        Cartão de Ponto
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {timecard.employee.name} ({timecard.employee.enNo})
                    </p>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4">
                <div className="card">
                    {/* Header with month navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePreviousMonth}
                                className="btn btn-secondary"
                            >
                                ← Mês Anterior
                            </button>
                            <h2 className="text-2xl font-bold">
                                {(() => {
                                    const [y, m] = month.split('-').map(Number);
                                    return format(new Date(y, m - 1, 1), 'MMMM yyyy');
                                })()}
                            </h2>
                            <button
                                onClick={handleNextMonth}
                                className="btn btn-secondary"
                            >
                                Próximo Mês →
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-primary"
                            >
                                📄 Exportar PDF
                            </button>
                            <button
                                onClick={handleDownloadExcel}
                                className="btn btn-primary"
                            >
                                📊 Exportar Excel
                            </button>
                        </div>
                    </div>

                    {/* Timecard table */}
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Entrada 1</th>
                                    <th>Saída 1</th>
                                    <th>Entrada 2</th>
                                    <th>Saída 2</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timecard.workdays.map((workday) => (
                                    <WorkdayRow
                                        key={workday.id}
                                        workday={workday}
                                        onUpdate={loadTimecard}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total hours */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <p className="text-gray-600">Total do Mês</p>
                                <p className="text-3xl font-bold text-primary-600">
                                    {timecard.totalHours}h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
