import { TimelineItem, TimelineSource } from '../types/timeline';
import { SignalMessageSource } from '../sources/signal';

export class TimelineService {
    private sources: TimelineSource[] = [];

    constructor() {
        // Register available sources
        this.sources.push(new SignalMessageSource());
    }

    registerSource(source: TimelineSource) {
        this.sources.push(source);
    }

    getSources(): TimelineSource[] {
        return this.sources;
    }

    async getTimelineItems(centerTime: number, count: number): Promise<TimelineItem[]> {
        // Calculate how many items to request in each direction
        const prevCount = Math.floor(count / 2);
        const nextCount = count - prevCount;

        // Request items from each source
        const prevPromises = this.sources.map(source =>
            source.getPrevItems(centerTime, prevCount)
        );
        const nextPromises = this.sources.map(source =>
            source.getNextItems(centerTime, nextCount)
        );

        // Wait for all sources to return items
        const [prevArrays, nextArrays] = await Promise.all([
            Promise.all(prevPromises),
            Promise.all(nextPromises)
        ]);

        // Merge all items from each direction and sort by timestamp (oldest first)
        const allPrevItems = prevArrays.flat().sort((a, b) => a.timestamp - b.timestamp);
        const allNextItems = nextArrays.flat().sort((a, b) => a.timestamp - b.timestamp);

        // Take the last prevCount items from prev and first nextCount items from next
        const prevItems = allPrevItems.slice(-prevCount);
        const nextItems = allNextItems.slice(0, nextCount);

        // Combine the results
        return [...prevItems, ...nextItems];
    }
} 