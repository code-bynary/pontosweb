import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMonthlyTimecard, downloadPDF, downloadExcel, recalculateWorkdays } from '../services/api';
import WorkdayRow from '../components/WorkdayRow';
import AbonoModal from '../components/AbonoModal';
import Header from '../components/Header';
import { format, addMonths, subMonths } from 'date-fns';

export default function TimecardPage() {
    const { employeeId, month } = useParams();
    const navigate = useNavigate();
    const [timecard, setTimecard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorkday, setSelectedWorkday] = useState(null);

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

    const handleRecalculate = async () => {
        if (!window.confirm('Deseja recalcular todas as batidas deste mês? Isso irá atualizar as horas baseando-se nas batidas originais.')) {
            return;
        }

        setLoading(true);
        try {
            const [year, monthNum] = month.split('-').map(Number);
            const startDate = new Date(Date.UTC(year, monthNum - 1, 1)).toISOString();
            const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59)).toISOString();

            await recalculateWorkdays(employeeId, startDate, endDate);
            await loadTimecard();
            alert('Recálculo concluído com sucesso!');
        } catch (err) {
            alert('Erro ao recalcular: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
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
            <Header
                title="Cartão de Ponto"
                subtitle={`${timecard.employee.name} (${timecard.employee.enNo})`}
                onBack="/"
            />

            <div className="max-w-7xl mx-auto px-4">
                <div className="card">
                    {/* Header with month navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePreviousMonth}
                                className="btn btn-secondary"
                            >
                                ← Mês Anterior
                            </button>
                            <h2 className="text-2xl font-bold min-w-[12rem] text-center">
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
                                📊 Excel
                            </button>
                            <button
                                onClick={handleRecalculate}
                                className="btn btn-secondary"
                                title="Recalcular todas as batidas deste mês"
                            >
                                🔄 Recalcular Mês
                            </button>
                        </div>
                    </div>

                    {/* Legend Section */}
                    <div className="flex flex-wrap gap-4 mb-6 text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 border-dashed">
                        <span className="text-gray-400 uppercase tracking-widest mr-2 flex items-center">Legenda Abonos:</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-100">
                            <span className="text-lg">🏥</span> Saúde
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100">
                            <span className="text-lg">🏠</span> Folga
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                            <span className="text-lg">📄</span> Doc/Comp.
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                            <span className="text-lg">🔘</span> Outros
                        </div>
                    </div>

                    {/* Timecard table */}
                    <div className="overflow-x-auto mb-8">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Entrada 1</th>
                                    <th>Saída 1</th>
                                    <th>Entrada 2</th>
                                    <th>Saída 2</th>
                                    <th>Trabalhado</th>
                                    <th>Abonado</th>
                                    <th>Previsto</th>
                                    <th>Extra</th>
                                    <th>Saldo</th>
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
                                        onAbono={() => setSelectedWorkday(workday)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Detailed Statistics Summary */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            📊 Resumo Mensal Detalhado
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Total Previsto</p>
                                <p className="text-2xl font-bold text-gray-800">{timecard.totalExpectedHours}h</p>
                            </div>

                            <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Trabalhado</p>
                                <p className="text-2xl font-bold text-primary-600">{timecard.totalHours}h</p>
                            </div>

                            <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Abonado</p>
                                <p className="text-2xl font-bold text-blue-600">{timecard.stats.totalAbonoHours}h</p>
                                <div className="mt-1 flex flex-wrap gap-x-2">
                                    <span className="text-[10px] text-blue-400 font-medium whitespace-nowrap">D. Inteiros: {timecard.stats.abonoByCategory.FULL_DAY}</span>
                                    <span className="text-[10px] text-blue-400 font-medium whitespace-nowrap">Parciais: {timecard.stats.abonoByCategory.PARTIAL}</span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Horas Extras</p>
                                <p className="text-2xl font-bold text-green-600">+{timecard.stats.totalExtraHours}h</p>
                            </div>

                            <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Atrasos/Faltas</p>
                                <p className="text-2xl font-bold text-red-600">-{timecard.stats.totalDelayHours}h</p>
                            </div>
                        </div>

                        {/* Final Balance Highlight */}
                        <div className={`mt-6 p-6 rounded-xl flex items-center justify-between ${timecard.totalBalanceMinutes >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white shadow-lg'}`}>
                            <div>
                                <h3 className="text-lg font-medium opacity-90">Saldo Final do Mês</h3>
                                <p className="text-sm opacity-75">Considerando (Trabalhado + Abonado) - Previsto</p>
                            </div>
                            <div className="text-4xl font-black">
                                {timecard.totalBalanceMinutes > 0 ? '+' : ''}{timecard.totalBalanceHours}h
                            </div>
                        </div>
                    </div>
                </div>

                {selectedWorkday && (
                    <AbonoModal
                        workday={selectedWorkday}
                        onClose={() => setSelectedWorkday(null)}
                        onSuccess={loadTimecard}
                    />
                )}
            </div>
        </div>
    );
}
