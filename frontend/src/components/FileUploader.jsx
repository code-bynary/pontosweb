import { useState } from 'react';
import { uploadFile } from '../services/api';

export default function FileUploader({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.txt')) {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Por favor, selecione um arquivo .txt');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await uploadFile(file);
            setResult(response);
            if (onUploadSuccess) {
                onUploadSuccess(response);
            }
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer upload do arquivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Importar Arquivo de Ponto</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o arquivo TXT
                </label>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="input"
                    disabled={uploading}
                />
            </div>

            {file && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Arquivo selecionado: <strong>{file.name}</strong>
                    </p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? 'Enviando...' : 'Enviar Arquivo'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {result && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Importação Concluída!</h3>
                    <p className="text-green-800">
                        Processados: <strong>{result.processed}</strong> de <strong>{result.total}</strong> registros
                    </p>
                    {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                            <p className="text-yellow-800 font-medium">Erros encontrados:</p>
                            <ul className="list-disc list-inside text-sm text-yellow-700">
                                {result.errors.slice(0, 5).map((err, idx) => (
                                    <li key={idx}>Linha {err.line}: {err.error}</li>
                                ))}
                                {result.errors.length > 5 && (
                                    <li>... e mais {result.errors.length - 5} erros</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
