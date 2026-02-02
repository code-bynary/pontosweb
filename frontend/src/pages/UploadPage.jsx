import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import EmployeeList from '../components/EmployeeList';
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
            <nav className="bg-white shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-600">
                            📊 Dashboard <span className="text-sm font-normal text-gray-400">v1.7.0</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Sistema de Controle de Ponto Eletrônico</p>
                    </div>
                    <div className="flex gap-2">
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
                    </div>
                </div>
            </nav>

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
