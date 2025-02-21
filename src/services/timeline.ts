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

    async getTimelineItems(startTime: number, endTime: number): Promise<TimelineItem[]> {
        // Fetch items from all sources
        const itemPromises = this.sources.map(source =>
            source.getItems(startTime, endTime)
        );

        // Wait for all sources to return items
        const itemArrays = await Promise.all(itemPromises);

        // Merge and sort all items by timestamp
        const allItems = itemArrays.flat();
        return allItems.sort((a, b) => a.timestamp - b.timestamp);
    }
} 