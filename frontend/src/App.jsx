import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import TimecardPage from './pages/TimecardPage';
import HolidaysPage from './pages/HolidaysPage';
import ReportsPage from './pages/ReportsPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/timecard/:employeeId/:month" element={<TimecardPage />} />
                <Route path="/holidays" element={<HolidaysPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile/:employeeId" element={<EmployeeProfilePage />} />
            </Routes>
        </BrowserRouter>
    );
}
