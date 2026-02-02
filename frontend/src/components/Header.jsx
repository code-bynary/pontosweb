import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, onBack, actions }) {
    const navigate = useNavigate();
    const APP_VERSION = "v1.8.0";

    return (
        <nav className="bg-white shadow-sm mb-8">
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={typeof onBack === 'string' ? () => navigate(onBack) : onBack}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary-600 px-3 py-1.5 rounded-lg border border-gray-100 transition-all font-medium text-sm flex items-center gap-1 group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar
                            </button>
                        )}
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-2xl md:text-3xl font-black text-primary-600 tracking-tight">
                                {title}
                            </h1>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                {APP_VERSION}
                            </span>
                        </div>
                    </div>
                    {subtitle && (
                        <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            </div>
        </nav>
    );
}
