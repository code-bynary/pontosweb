import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import TimecardPage from './pages/TimecardPage';
import HolidaysPage from './pages/HolidaysPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/timecard/:employeeId/:month" element={<TimecardPage />} />
                <Route path="/holidays" element={<HolidaysPage />} />
            </Routes>
        </BrowserRouter>
    );
}
