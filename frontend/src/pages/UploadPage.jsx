import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import EmployeeList from '../components/EmployeeList';
import Header from '../components/Header';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { getEmployees, getDashboardStats } from '../services/api';

export default function UploadPage() {
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const loadData = async () => {
        setLoading(true);
        try {
            const [empData, statsData] = await Promise.all([
                getEmployees(),
                getDashboardStats()
            ]);
            setEmployees(empData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUploadSuccess = () => {
        loadData();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="📊 Dashboard"
                subtitle="Sistema de Controle de Ponto Eletrônico"
                actions={
                    <>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white hover:bg-gray-50 text-primary-600 px-4 py-2 rounded-xl border border-primary-200 font-bold transition-all flex items-center gap-2"
                        >
                            👤 Novo Colaborador
                        </button>
                        <button
                            onClick={() => navigate('/holidays')}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 font-bold transition-all flex items-center gap-2"
                        >
                            📅 Feriados
                        </button>
                        <button
                            onClick={() => navigate('/reports')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary-100 flex items-center gap-2"
                        >
                            📊 Relatórios Gerenciais
                        </button>
                    </>
                }
            />

            <div className="max-w-7xl mx-auto px-4 space-y-8 pb-12">
                {/* KPI Grid */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-primary-200 transition-all">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Presença Hoje</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-gray-800">{stats.employees.present}</h3>
                                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                                    🟢
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all duration-1000"
                                    style={{ width: `${(stats.employees.present / stats.employees.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-200 transition-all">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Banco Global (Mês)</p>
                            <div className="flex items-center justify-between">
                                <h3 className={`text-3xl font-black ${stats.monthly.balanceHours >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {stats.monthly.balanceHours}h
                                </h3>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                                    ⚡
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Extra: +{stats.monthly.extraHours}h | Atraso: -{stats.monthly.delayHours}h</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-primary-200 transition-all">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Checklist RH</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-primary-600">{stats.checklist.percent}%</h3>
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
                                    ✅
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">{stats.checklist.treated} de {stats.checklist.total} tratados</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-red-200 transition-all">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Ausentes Hoje</p>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-red-600">{stats.employees.absent}</h3>
                                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
                                    🔴
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Colaboradores sem batida</p>
                        </div>
                    </div>
                )}

                <FileUploader onUploadSuccess={handleUploadSuccess} />

                {loading && !stats ? (
                    <div className="card">
                        <p className="text-center text-gray-500">Carregando funcionários...</p>
                    </div>
                ) : (
                    <EmployeeList employees={employees} onUpdate={loadData} />
                )}

                <AddEmployeeModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={loadData}
                />
            </div>
        </div>
    );
}
