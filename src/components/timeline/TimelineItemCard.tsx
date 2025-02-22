import { TimelineItem, SignalMessageContent } from '../../types/timeline';
import { SignalMessageCard } from './SignalMessageCard';

interface TimelineItemCardProps {
    items: TimelineItem[];
    backgroundColor: string;
}

export function TimelineItemCard({ items, backgroundColor }: TimelineItemCardProps) {
    if (items.length === 0) {
        return null;
    }

    // All items in a thread group should have the same kind
    const kind = items[0].kind;
    const allSameKind = items.every(item => item.kind === kind);

    if (!allSameKind) {
        console.error('Inconsistent item kinds in thread group', items);
        return (
            <div className="text-red-400">
                Error: Inconsistent item types in thread group
            </div>
        );
    }

    const renderContent = () => {
        switch (kind) {
            case 'signal_message':
                return (
                    <SignalMessageCard
                        items={items.map(item => ({
                            content: item.content as SignalMessageContent,
                            timestamp: item.timestamp
                        }))}
                    />
                );
            default:
                return <div className="text-gray-400">Unknown item type: {kind}</div>;
        }
    };

    return (
        <div
            className="rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor }}
        >
            {renderContent()}
        </div>
    );
} 