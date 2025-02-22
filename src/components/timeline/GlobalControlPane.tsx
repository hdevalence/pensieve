import { useState } from 'react';

interface GlobalControlPaneProps {
    onResetFilters: () => void;
}

export function GlobalControlPane({ onResetFilters }: GlobalControlPaneProps) {
    const [isOpen, setIsOpen] = useState(false);

    const getHiddenThreads = (): string[] => {
        const hidden = localStorage.getItem('hiddenThreads');
        return hidden ? JSON.parse(hidden) : [];
    };

    const unhideThread = (threadId: string) => {
        const threads = getHiddenThreads().filter(id => id !== threadId);
        localStorage.setItem('hiddenThreads', JSON.stringify(threads));
        window.location.reload();
    };

    return (
        <div className="fixed top-4 right-4">
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <button
                    className="text-2xl bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors"
                >
                    ⚙️
                </button>

                {isOpen && (
                    <div
                        className="absolute top-0 right-0 bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px]"
                        style={{ transform: 'translateY(-2px)' }}
                    >
                        <div className="space-y-2">
                            <div className="text-gray-200 text-sm font-medium border-b border-gray-700 pb-2">
                                Hidden Threads ({getHiddenThreads().length})
                            </div>
                            {getHiddenThreads().length > 0 ? (
                                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                    {getHiddenThreads().map(threadId => (
                                        <div key={threadId} className="flex items-center justify-between gap-2 py-1">
                                            <div className="text-gray-300 text-sm truncate">
                                                {threadId}
                                            </div>
                                            <button
                                                onClick={() => unhideThread(threadId)}
                                                className="text-gray-400 hover:text-gray-200 text-sm"
                                                title="Unhide thread"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-sm py-1">
                                    No hidden threads
                                </div>
                            )}
                            {getHiddenThreads().length > 0 && (
                                <button
                                    onClick={onResetFilters}
                                    className="text-gray-200 hover:text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors w-full text-left text-sm mt-2 border-t border-gray-700"
                                >
                                    Reset all filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 