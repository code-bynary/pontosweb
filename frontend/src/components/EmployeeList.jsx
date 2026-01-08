import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EditScheduleModal from './EditScheduleModal';

export default function EmployeeList({ employees, onUpdate }) {
    const navigate = useNavigate();
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleViewTimecard = (employeeId) => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        navigate(`/timecard/${employeeId}/${currentMonth}`);
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Funcionários</h2>

            {employees.length === 0 ? (
                <p className="text-gray-500">Nenhum funcionário encontrado. Importe um arquivo de ponto primeiro.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
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
                                <tr key={employee.id}>
                                    <td>{employee.enNo}</td>
                                    <td className="font-medium">{employee.name}</td>
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
