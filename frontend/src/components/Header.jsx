import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, onBack, actions }) {
    const navigate = useNavigate();
    const APP_VERSION = "v2.0.0";

    return (
        <nav className="bg-white shadow-sm mb-8 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 group cursor-default">
                            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Pontos</span>
                            <span className="text-xl font-black text-primary-600 tracking-tighter uppercase">Web</span>
                            <span className="text-[10px] font-bold text-gray-400 ml-1">
                                {APP_VERSION}
                            </span>
                        </div>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                        {onBack && (
                            <button
                                onClick={typeof onBack === 'string' ? () => navigate(onBack) : onBack}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary-600 px-3 py-1.5 rounded-lg border border-gray-100 transition-all font-medium text-sm flex items-center gap-1 group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar
                            </button>
                        )}
                        <h1 className="text-xl md:text-2xl font-black text-primary-600 tracking-tight ml-2">
                            {title}
                        </h1>
                    </div>
                    {subtitle && (
                        <p className="text-gray-400 mt-1 text-xs md:text-sm flex items-center gap-2 font-medium">
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
