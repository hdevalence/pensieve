import { TimelineItem } from '../../types/timeline';
import { SignalMessageCard } from './SignalMessageCard';

interface TimelineItemCardProps {
    item: TimelineItem;
}

export function TimelineItemCard({ item }: TimelineItemCardProps) {
    const renderContent = () => {
        switch (item.kind) {
            case 'signal_message':
                return <SignalMessageCard content={item.content} timestamp={item.timestamp} />;
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