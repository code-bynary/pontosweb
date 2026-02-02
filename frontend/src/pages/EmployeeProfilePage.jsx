import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployee, updateEmployeeProfile } from '../services/api';
import Header from '../components/Header';

export default function EmployeeProfilePage() {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        jobTitle: '',
        salary: '',
        salaryReason: '',
        startDate: '',
        regDate: '',
        cep: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        phone: '',
        cpf: '',
        rg: '',
        pis: '',
        reservista: '',
        titulo: '',
        cnh: '',
        education: '',
        maritalStatus: '',
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
            setSalaryHistory(data.salaryHistory || []);
            setFormData({
                name: data.name || '',
                jobTitle: data.jobTitle || '',
                salary: data.salary || '',
                salaryReason: '',
                startDate: data.startDate?.split('T')[0] || '',
                regDate: data.regDate?.split('T')[0] || '',
                cep: data.cep || '',
                address: data.address || '',
                number: data.number || '',
                neighborhood: data.neighborhood || '',
                city: data.city || '',
                state: data.state || '',
                phone: data.phone || '',
                cpf: data.cpf || '',
                rg: data.rg || '',
                pis: data.pis || '',
                reservista: data.reservista || '',
                titulo: data.titulo || '',
                cnh: data.cnh || '',
                education: data.education || '',
                maritalStatus: data.maritalStatus || '',
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

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        address: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (error) {
                console.error('ViaCEP error:', error);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateEmployeeProfile(employeeId, formData);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! ✨' });
            loadEmployee(); // Reload to get updated salary history
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm";
    const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
    const sectionTitleClass = "text-lg font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-2";

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">
            Carregando cadastro completo...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header
                title="Gestão de Colaborador"
                subtitle={`Ficha de: ${formData.name}`}
                onBack="/"
            />

            <div className="max-w-5xl mx-auto px-4">
                {message && (
                    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
                        <span className="font-bold">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Seção 1: Dados Pessoais */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className={sectionTitleClass}>
                            <span className="w-4 h-4 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">1</span>
                            Dados Pessoais & Documentação
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Nome Completo</label>
                                <input type="text" className={inputClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Estado Civil</label>
                                <select className={inputClass} value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}>
                                    <option value="">Selecione...</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="União Estável">União Estável</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>CPF</label>
                                <input type="text" placeholder="000.000.000-00" className={inputClass} value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>RG</label>
                                <input type="text" className={inputClass} value={formData.rg} onChange={(e) => setFormData({ ...formData, rg: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>PIS / PASEP</label>
                                <input type="text" className={inputClass} value={formData.pis} onChange={(e) => setFormData({ ...formData, pis: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Reservista</label>
                                <input type="text" className={inputClass} value={formData.reservista} onChange={(e) => setFormData({ ...formData, reservista: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Título de Eleitor</label>
                                <input type="text" className={inputClass} value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>CNH</label>
                                <input type="text" placeholder="Nº da Carteira" className={inputClass} value={formData.cnh} onChange={(e) => setFormData({ ...formData, cnh: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Escolaridade</label>
                                <input type="text" placeholder="Ex: Superior Completo" className={inputClass} value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Telefone / WhatsApp</label>
                                <input type="text" placeholder="(00) 00000-0000" className={inputClass} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Endereço */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className={sectionTitleClass}>
                            <span className="w-4 h-4 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">2</span>
                            Endereço Residencial
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClass}>CEP</label>
                                <input
                                    type="text"
                                    placeholder="00000-000"
                                    className={inputClass}
                                    value={formData.cep}
                                    onBlur={handleCepBlur}
                                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Logradouro</label>
                                <input type="text" className={inputClass} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Número</label>
                                <input type="text" className={inputClass} value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Bairro</label>
                                <input type="text" className={inputClass} value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Cidade</label>
                                <input type="text" className={inputClass} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Estado (UF)</label>
                                <input type="text" maxLength="2" className={inputClass} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })} />
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Trabalho & Finanças */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className={sectionTitleClass}>
                            <span className="w-4 h-4 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">3</span>
                            Trabalho & Finanças
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Cargo / Função</label>
                                <input type="text" className={inputClass} value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Salário Base Atual (R$)</label>
                                <div className="space-y-4">
                                    <input type="number" step="0.01" className={`${inputClass} text-emerald-600 font-black text-lg`} value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                                    {formData.salary !== (employee?.salary || '').toString() && (
                                        <input
                                            type="text"
                                            placeholder="Motivo da alteração salarial..."
                                            className="w-full text-xs font-medium border-b border-dashed border-gray-200 py-1 bg-transparent outline-none focus:border-primary-400"
                                            value={formData.salaryReason}
                                            onChange={(e) => setFormData({ ...formData, salaryReason: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Data de Admissão</label>
                                <input type="date" className={inputClass} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Data de Registro</label>
                                <input type="date" className={inputClass} value={formData.regDate} onChange={(e) => setFormData({ ...formData, regDate: e.target.value })} />
                            </div>
                        </div>

                        {/* Histórico Salarial */}
                        {salaryHistory.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <label className={labelClass}>Histórico de Alterações Salariais</label>
                                <div className="space-y-3">
                                    {salaryHistory.map((hist) => (
                                        <div key={hist.id} className="flex items-center justify-between text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-700">R$ {parseFloat(hist.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span className="text-gray-400">{hist.reason || 'Alteração cadastral'}</span>
                                            </div>
                                            <span className="text-gray-400 font-medium">{new Date(hist.changeDate).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seção 4: Família */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className={sectionTitleClass}>
                            <span className="w-4 h-4 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">4</span>
                            Filiação
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Nome do Pai</label>
                                <input type="text" className={inputClass} value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Nome da Mãe</label>
                                <input type="text" className={inputClass} value={formData.motherName} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-12 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white sticky bottom-6 z-40">
                        <button type="button" onClick={() => navigate('/')} className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all">Cancelar</button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-12 py-4 rounded-2xl font-black bg-primary-600 text-white shadow-xl shadow-primary-100 hover:bg-primary-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3"
                        >
                            {saving ? '⏳ Gravando...' : '💾 Salvar Ficha Completa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
