import { useEffect, useState, useRef } from 'react';
import { TimelineItem } from '../../src/types/timeline';
import { Timeline } from '../../src/components/timeline/Timeline';
import { GlobalControlPane } from '../../src/components/timeline/GlobalControlPane';

const ITEMS_PER_PAGE = 200;

export default function MessagesPage() {
    const [items, setItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const centerItemRef = useRef<HTMLDivElement>(null);

    // Load items on mount
    useEffect(() => {
        async function loadItems() {
            try {
                setLoading(true);
                const hash = window.location.hash;
                const timestamp = hash ? parseInt(hash.replace('#t=', '')) : Date.now();

                const response = await fetch(
                    `/api/timeline?center=${timestamp}&count=${ITEMS_PER_PAGE}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch timeline items');
                }
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error('Error fetching timeline items:', error);
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, []);

    const handleResetFilters = () => {
        localStorage.removeItem('hiddenThreads');
        // Force a full page reload to ensure everything is reset
        window.location.reload();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div ref={containerRef} className="h-screen overflow-y-auto">
            <GlobalControlPane onResetFilters={handleResetFilters} />
            <div className="max-w-5xl mx-auto">
                <Timeline items={items} centerRef={centerItemRef} />
            </div>
        </div>
    );
} 