import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, updateEmployeeProfile } from '../services/api';
import Header from '../components/Header';

export default function EmployeeProfilePage() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        jobTitle: '',
        salary: '',
        startDate: '',
        regDate: '',
        address: '',
        phone: '',
        cpf: '',
        rg: '',
        pis: '',
        reservista: '',
        titulo: '',
        fatherName: '',
        motherName: '',
        childrenInfo: []
    });

    useEffect(() => {
        loadEmployee();
    }, [employeeId]);

    const loadEmployee = async () => {
        try {
            const data = await getEmployee(employeeId);
            setEmployee(data);
            setFormData({
                name: data.name || '',
                jobTitle: data.jobTitle || '',
                salary: data.salary || '',
                startDate: data.startDate?.split('T')[0] || '',
                regDate: data.regDate?.split('T')[0] || '',
                address: data.address || '',
                phone: data.phone || '',
                cpf: data.cpf || '',
                rg: data.rg || '',
                pis: data.pis || '',
                reservista: data.reservista || '',
                titulo: data.titulo || '',
                fatherName: data.fatherName || '',
                motherName: data.motherName || '',
                childrenInfo: data.childrenInfo || []
            });
        } catch (error) {
            console.error('Error loading employee:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateEmployeeProfile(employeeId, formData);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! ✨' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">
            Carregando perfil profissional...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header
                title="Perfil do Colaborador"
                subtitle={`${formData.name} • Identidade v2.0`}
                onBack="/"
            />

            <div className="max-w-4xl mx-auto px-4">
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-red-600 text-white shadow-lg shadow-red-100'}`}>
                        <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'personal' ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        📄 Dados Pessoais
                    </button>
                    <button
                        onClick={() => setActiveTab('work')}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'work' ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        💼 Trabalho
                    </button>
                    <button
                        onClick={() => setActiveTab('family')}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'family' ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        🏠 Família
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {activeTab === 'personal' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                Informações Básicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">RG</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.rg}
                                        onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Endereço Residencial</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'work' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                Dados da Contratação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cargo / Função</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Salário Base (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data de Admissão</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data de Registro</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.regDate}
                                        onChange={(e) => setFormData({ ...formData, regDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">PIS</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.pis}
                                        onChange={(e) => setFormData({ ...formData, pis: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'family' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                Filiação e Dependentes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Pai</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.fatherName}
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome da Mãe</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                        value={formData.motherName}
                                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-12">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-8 py-4 rounded-2xl font-bold bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-12 py-4 rounded-2xl font-black bg-primary-600 text-white shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin text-lg">⏳</span> Salvando...
                                </>
                            ) : (
                                <>
                                    💾 Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
