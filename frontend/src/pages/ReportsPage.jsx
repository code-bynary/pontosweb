import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMonthlyCompanyReport, downloadCompanyReportExcel } from '../services/api';
import Header from '../components/Header';

export default function ReportsPage() {
    const navigate = useNavigate();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMonthlyCompanyReport(month);
            setReport(data);
        } catch (err) {
            console.error('Fetch report error:', err);
            setError('Falha ao carregar relatório mensal.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        try {
            downloadCompanyReportExcel(month);
        } catch (err) {
            console.error('Export error:', err);
            alert('Erro ao exportar relatório.');
        }
    };

    const totals = report.reduce((acc, curr) => {
        if (curr.error) return acc;
        return {
            balanceMinutes: acc.balanceMinutes + (curr.balanceMinutes || 0),
            count: acc.count + 1
        };
    }, { balanceMinutes: 0, count: 0 });

    const formatMins = (mins) => {
        const abs = Math.abs(mins);
        const h = Math.floor(abs / 60);
        const m = abs % 60;
        const sign = mins < 0 ? '-' : '';
        return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Relatórios Gerenciais"
                subtitle="Visão macro consolidada de toda a empresa"
                onBack="/"
            />

            <main className="max-w-7xl mx-auto px-4 pb-12">
                {/* Filters & Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mês de Referência</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="h-12 w-px bg-gray-100 hidden sm:block"></div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total de Colaboradores</p>
                            <p className="text-xl font-bold text-gray-700">{report.length}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleExportExcel}
                        disabled={loading || report.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        📂 Exportar Consolidado (Excel)
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Colaborador</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Esperado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Trabalhado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Abonos</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Extras</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Saldo Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">Carregando dados...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-red-400">{error}</td>
                                    </tr>
                                ) : report.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Nenhum dado para este período.</td>
                                    </tr>
                                ) : (
                                    report.map((emp) => (
                                        <tr key={emp.employeeId} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-700">{emp.name}</div>
                                                <div className="text-[10px] text-gray-400">Matrícula: {emp.enNo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{emp.expectedHours}h</td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{emp.workedHours}h</td>
                                            <td className="px-6 py-4">
                                                <span className="text-blue-600 font-medium">{emp.abonoHours}h</span>
                                                <span className="text-[10px] text-gray-400 ml-1">({emp.abonoCount})</span>
                                            </td>
                                            <td className="px-6 py-4 text-green-600 font-medium">+{emp.extraHours}h</td>
                                            <td className={`px-6 py-4 text-right font-bold ${emp.balanceMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {emp.balanceHours}h
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-primary-50/30 border-t border-primary-100">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-primary-800">TOTAL CONSOLIDADO</td>
                                    <td colSpan="4"></td>
                                    <td className={`px-6 py-4 text-right font-black text-lg ${totals.balanceMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatMins(totals.balanceMinutes)}h
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
