import { useState, useEffect } from 'react';
import { TimelineItem } from '../../types/timeline';
import { TimelineItemCard } from './TimelineItemCard';
import Editor from '@monaco-editor/react';

interface TimelineProps {
    startTime: number;
    itemCount?: number;
}

type ThreadGroup = {
    threadId: string;
    items: TimelineItem[];
};

function groupItemsByThread(items: TimelineItem[]): ThreadGroup[] {
    const groups: ThreadGroup[] = [];
    let currentGroup: ThreadGroup | null = null;

    for (const item of items) {
        if (!currentGroup || currentGroup.threadId !== item.threadId) {
            // Start a new group
            currentGroup = {
                threadId: item.threadId,
                items: [item]
            };
            groups.push(currentGroup);
        } else {
            // Add to existing group
            currentGroup.items.push(item);
        }
    }

    return groups;
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

    const threadGroups = groupItemsByThread(items);

    return (
        <div className="space-y-8 p-4">
            <div className="space-y-4">
                {threadGroups.map((group) => (
                    <TimelineItemCard key={group.threadId} items={group.items} />
                ))}
            </div>

            <div className="border border-gray-700 rounded-lg overflow-hidden">
                <Editor
                    height="900px"
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