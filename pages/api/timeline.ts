import { NextApiRequest, NextApiResponse } from 'next';
import { TimelineService } from '@/services/timeline';

const timelineService = new TimelineService();
const DEFAULT_COUNT = 50;
const MAX_COUNT = 1000;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { start, count } = req.query;

        if (!start) {
            return res.status(400).json({ error: 'Missing start timestamp' });
        }

        const startTime = parseInt(start as string);
        if (isNaN(startTime)) {
            return res.status(400).json({ error: 'Invalid start timestamp format' });
        }

        let itemCount = count ? parseInt(count as string) : DEFAULT_COUNT;
        if (isNaN(itemCount)) {
            itemCount = DEFAULT_COUNT;
        }
        // Enforce maximum count to prevent excessive data fetching
        itemCount = Math.min(itemCount, MAX_COUNT);

        const items = await timelineService.getTimelineItems(startTime, itemCount);
        res.status(200).json(items);
    } catch (error) {
        console.error('Timeline API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 