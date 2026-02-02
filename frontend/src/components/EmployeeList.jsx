import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toggleEmployeeTreatment, resetAllTreatment } from '../services/api';
import EditScheduleModal from './EditScheduleModal';

export default function EmployeeList({ employees, onUpdate }) {
    const navigate = useNavigate();
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleViewTimecard = (employeeId) => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        navigate(`/timecard/${employeeId}/${currentMonth}`);
    };

    const handleToggleTreated = async (employeeId) => {
        try {
            await toggleEmployeeTreatment(employeeId);
            onUpdate();
        } catch (error) {
            console.error('Error toggling treatment:', error);
        }
    };

    const handleResetAll = async () => {
        if (window.confirm('Deseja realmente limpar toda a conferência? Isso desmarcará todos os funcionários.')) {
            try {
                await resetAllTreatment();
                onUpdate();
            } catch (error) {
                console.error('Error resetting treatment:', error);
            }
        }
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Funcionários</h2>
                {employees.length > 0 && (
                    <button
                        onClick={handleResetAll}
                        className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-1"
                    >
                        🗑️ Limpar Conferência
                    </button>
                )}
            </div>

            {employees.length === 0 ? (
                <p className="text-gray-500">Nenhum funcionário encontrado. Importe um arquivo de ponto primeiro.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-10">🗹</th>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Batidas</th>
                                <th>Jornadas</th>
                                <th>Última Batida</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.id} className={employee.isTreated ? 'opacity-50 grayscale select-none bg-gray-50/50' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={employee.isTreated || false}
                                            onChange={() => handleToggleTreated(employee.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                            title="Marcar como conferido"
                                        />
                                    </td>
                                    <td>{employee.enNo}</td>
                                    <td className="font-medium">
                                        {employee.name}
                                        {employee.isTreated && (
                                            <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">Tratado</span>
                                        )}
                                    </td>
                                    <td>{employee.punchCount}</td>
                                    <td>{employee.workdayCount}</td>
                                    <td>
                                        {employee.lastPunch
                                            ? format(new Date(employee.lastPunch), 'dd/MM/yyyy HH:mm')
                                            : '-'}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewTimecard(employee.id)}
                                                className="btn btn-primary text-sm"
                                            >
                                                Ver Cartão
                                            </button>
                                            <button
                                                onClick={() => setSelectedEmployee(employee)}
                                                className="btn btn-secondary text-sm p-2"
                                                title="Configurar Horário"
                                            >
                                                ⚙️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedEmployee && (
                <EditScheduleModal
                    isOpen={!!selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    employee={selectedEmployee}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}
