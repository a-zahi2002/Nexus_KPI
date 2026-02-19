import { useState } from 'react';
import { X, Download, CheckSquare } from 'lucide-react';

export interface ColumnOption {
    key: string;
    label: string;
}

interface ExportOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (selectedColumns: string[], includeHeaders: boolean) => void;
    availableColumns: ColumnOption[];
}

export function ExportOptionsModal({
    isOpen,
    onClose,
    onExport,
    availableColumns,
}: ExportOptionsModalProps) {
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        availableColumns.map((col) => col.key)
    );
    const [includeHeaders, setIncludeHeaders] = useState(true);

    if (!isOpen) return null;

    const toggleColumn = (key: string) => {
        setSelectedColumns((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const toggleAll = () => {
        if (selectedColumns.length === availableColumns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(availableColumns.map((col) => col.key));
        }
    };

    const handleExport = () => {
        onExport(selectedColumns, includeHeaders);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Export Options
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Select Columns
                            </label>
                            <button
                                onClick={toggleAll}
                                className="text-xs text-maroon-600 dark:text-maroon-400 hover:underline font-medium"
                            >
                                {selectedColumns.length === availableColumns.length
                                    ? 'Deselect All'
                                    : 'Select All'}
                            </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {availableColumns.map((col) => (
                                <button
                                    key={col.key}
                                    onClick={() => toggleColumn(col.key)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left group"
                                >
                                    <div className={`
                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${selectedColumns.includes(col.key)
                                            ? 'bg-maroon-600 border-maroon-600 text-white'
                                            : 'border-gray-300 dark:border-gray-600 text-transparent group-hover:border-maroon-500'}
                  `}>
                                        <CheckSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {col.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setIncludeHeaders(!includeHeaders)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors w-full text-left"
                        >
                            <div className={`
                w-5 h-5 rounded border flex items-center justify-center transition-colors
                ${includeHeaders
                                    ? 'bg-maroon-600 border-maroon-600 text-white'
                                    : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-maroon-500'}
              `}>
                                <CheckSquare className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                Include Headers
                            </span>
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={selectedColumns.length === 0}
                        className="px-4 py-2 bg-maroon-600 hover:bg-maroon-700 disabled:bg-maroon-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
