import { useEffect, RefObject } from 'react';
import { TimelineItem } from '../../types/timeline';
import { TimelineItemCard } from './TimelineItemCard';

function getThreadColor(threadId: string): string {
    // Use a hash function to generate a number between 0 and 1
    const hash = threadId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Convert hash to a value between 0 and 360 (hue angle)
    const hue = Math.abs(hash) % 360;

    // Use fixed saturation and lightness values that work well with dark theme
    // Low opacity to maintain readability
    return `hsla(${hue}, 70%, 40%, 0.15)`;
}

function getHiddenThreads(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    const hidden = localStorage.getItem('hiddenThreads');
    return new Set(hidden ? JSON.parse(hidden) : []);
}

interface TimelineProps {
    items: TimelineItem[];
    centerRef: RefObject<HTMLDivElement>;
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

export function Timeline({ items, centerRef }: TimelineProps) {
    const hiddenThreads = getHiddenThreads();
    const groups = groupItemsByThread(items);
    const threadGroups = groups.filter(group => !hiddenThreads.has(group.threadId));

    const hash = window.location.hash;
    const centerTimestamp = hash ? parseInt(hash.replace('#t=', '')) : Date.now();

    useEffect(() => {
        if (centerRef.current) {
            centerRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [items, centerRef]);

    return (
        <div className="space-y-8 p-4">
            <div className="space-y-4">
                {threadGroups.map((group) => {
                    const containsCenterItem = group.items.some(
                        item => item.timestamp === centerTimestamp
                    );

                    return (
                        <div
                            key={group.threadId}
                            ref={containsCenterItem ? centerRef : null}
                        >
                            <TimelineItemCard
                                items={group.items}
                                backgroundColor={getThreadColor(group.threadId)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 