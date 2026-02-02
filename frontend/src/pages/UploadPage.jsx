import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import EmployeeList from '../components/EmployeeList';
import Header from '../components/Header';
import { getEmployees } from '../services/api';

export default function UploadPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleUploadSuccess = () => {
        loadEmployees();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="📊 Dashboard"
                subtitle="Sistema de Controle de Ponto Eletrônico"
                actions={
                    <>
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

            <div className="max-w-7xl mx-auto px-4 space-y-8">
                <FileUploader onUploadSuccess={handleUploadSuccess} />

                {loading ? (
                    <div className="card">
                        <p className="text-center text-gray-500">Carregando funcionários...</p>
                    </div>
                ) : (
                    <EmployeeList employees={employees} onUpdate={loadEmployees} />
                )}
            </div>
        </div>
    );
}
