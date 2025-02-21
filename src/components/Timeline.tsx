import { useState, useEffect } from 'react';
import { TimelineItem, SignalMessageContent } from '../types/timeline';
import Editor from '@monaco-editor/react';

interface TimelineProps {
    startTime: number;
    itemCount?: number;
}

export function Timeline({ startTime, itemCount = 50 }: TimelineProps) {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/timeline?start=${startTime}&count=${itemCount}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch timeline items');
                }
                const data = await response.json();
                setItems(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, [startTime, itemCount]);

    if (loading) return <div className="p-4 text-gray-300">Loading timeline...</div>;
    if (error) return <div className="p-4 text-red-400">Error: {error}</div>;

    return (
        <div className="space-y-8 p-4">
            <div className="space-y-4">
                {items.map((item) => (
                    <TimelineItemCard key={item.id} item={item} />
                ))}
            </div>

            <div className="border border-gray-700 rounded-lg overflow-hidden">
                <Editor
                    height="400px"
                    defaultLanguage="json"
                    value={JSON.stringify(items, null, 2)}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        folding: true,
                        theme: 'vs-dark'
                    }}
                />
            </div>
        </div>
    );
}

function TimelineItemCard({ item }: { item: TimelineItem }) {
    const date = new Date(item.timestamp);

    const renderContent = () => {
        switch (item.kind) {
            case 'signal_message': {
                const content = item.content as SignalMessageContent;
                return (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-100">{content.senderName}</span>
                            <span className="text-gray-400">
                                {date.toLocaleTimeString()}
                            </span>
                        </div>
                        {content.groupName && (
                            <div className="text-sm text-gray-400">
                                in {content.groupName}
                            </div>
                        )}
                        <div className="text-gray-200">{content.body}</div>
                        {content.hasVisualMediaAttachments && (
                            <div className="text-sm text-indigo-400">
                                [Has media attachments]
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return <div className="text-gray-400">Unknown item type: {item.kind}</div>;
        }
    };

    return (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow">
            {renderContent()}
        </div>
    );
} 