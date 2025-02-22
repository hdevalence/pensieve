import { useEffect, RefObject } from 'react';
import { SignalMessageContent, TimelineItem } from '../../types/timeline';
import { TimelineItemCard } from './TimelineItemCard';
import { sha256 } from 'js-sha256';

function getThreadColor(threadId: string): string {
    // 1. Compute SHA-256 of the threadId as a hex string
    const hashHex = sha256(threadId);

    // 2. Take the first 8 hex characters (which represents 4 bytes)
    //    and parse them as a 32-bit unsigned integer
    const firstEightHex = hashHex.slice(0, 8);
    const numeric = parseInt(firstEightHex, 16);

    // 3. Reduce that value to a hue (0–359)
    const hue = numeric % 360;

    // 4. Construct an HSLA color string
    return `hsla(${hue}, 70%, 15%, 1)`;
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

function formatChatText(groups: ThreadGroup[]): string {
    let buffer = '';

    for (const group of groups) {
        buffer += '<CHAT>\n';
        for (const item of group.items) {
            const content = item.content as SignalMessageContent;
            const isOutgoing = content.type === 'outgoing';
            const sender = isOutgoing ? 'You' : content.senderName;
            const receiver = isOutgoing ? content.destName : 'You';
            const time = new Date(item.timestamp).toLocaleString();
            buffer += `${time} [${sender}] => [${receiver}]: ${content.body}\n`;
        }
        buffer += '</CHAT>\n\n';
    }

    return buffer;
}

export function Timeline({ items, centerRef }: TimelineProps) {
    const hiddenThreads = getHiddenThreads();
    const groups = groupItemsByThread(items);
    const threadGroups = groups.filter(group => !hiddenThreads.has(group.threadId));

    const hash = window.location.hash;
    const centerTimestamp = hash ? parseInt(hash.replace('#t=', '')) : Date.now();

    const chatText = formatChatText(threadGroups);

    const handleCopyClick = () => {
        navigator.clipboard.writeText(chatText);
    };

    useEffect(() => {
        if (centerRef.current) {
            centerRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [items, centerRef]);

    return (
        <div className="space-y-8 p-4">
            <div className="space-y-2">
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
            <button
                onClick={handleCopyClick}
                className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Copy Chat Text
            </button>
        </div>
    );
} 