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

    async getTimelineItems(startTime: number, count: number): Promise<TimelineItem[]> {
        // Request count items from each source to ensure we have enough after merging
        const itemPromises = this.sources.map(source =>
            source.getItems(startTime, count)
        );

        // Wait for all sources to return items
        const itemArrays = await Promise.all(itemPromises);

        // Merge all items and sort by timestamp (newest first)
        const allItems = itemArrays.flat().sort((a, b) => b.timestamp - a.timestamp);

        // Return only the requested number of items
        return allItems.slice(0, count);
    }
} 