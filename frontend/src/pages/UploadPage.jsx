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
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-3xl font-bold text-primary-600">
                        ⏰ PontosWeb
                    </h1>
                    <p className="text-gray-600 mt-1">Sistema de Controle de Ponto Eletrônico</p>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 space-y-8">
                <FileUploader onUploadSuccess={handleUploadSuccess} />

                {loading ? (
                    <div className="card">
                        <p className="text-center text-gray-500">Carregando funcionários...</p>
                    </div>
                ) : (
                    <EmployeeList employees={employees} />
                )}
            </div>
        </div>
    );
}
