import { useState, useEffect } from 'react';
import { TimelineItem, SignalMessageContent } from '../types/timeline';

interface TimelineProps {
    startTime: number;
    endTime: number;
}

export function Timeline({ startTime, endTime }: TimelineProps) {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/timeline?start=${startTime}&end=${endTime}`
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
    }, [startTime, endTime]);

    if (loading) return <div className="p-4">Loading timeline...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-4 p-4">
            {items.map((item) => (
                <TimelineItemCard key={item.id} item={item} />
            ))}
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
                            <span className="font-medium">{content.senderName}</span>
                            <span className="text-gray-500">
                                {date.toLocaleTimeString()}
                            </span>
                        </div>
                        {content.groupName && (
                            <div className="text-sm text-gray-600">
                                in {content.groupName}
                            </div>
                        )}
                        <div className="text-gray-800">{content.body}</div>
                        {content.hasVisualMediaAttachments && (
                            <div className="text-sm text-blue-500">
                                [Has media attachments]
                            </div>
                        )}
                    </div>
                );
            }
            default:
                return <div>Unknown item type: {item.kind}</div>;
        }
    };

    return (
        <div className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
            {renderContent()}
        </div>
    );
} 