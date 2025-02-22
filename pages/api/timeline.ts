import { NextApiRequest, NextApiResponse } from 'next';
import { TimelineService } from '../../src/services/timeline';

const timelineService = new TimelineService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Handle thread navigation endpoints
        if (req.query.action === 'nextThread' || req.query.action === 'prevThread') {
            const threadId = req.query.threadId as string;
            const timestamp = parseInt(req.query.timestamp as string);

            if (!threadId || isNaN(timestamp)) {
                return res.status(400).json({ error: 'Invalid threadId or timestamp' });
            }

            let nextTimestamp: number | null = null;
            for (const source of timelineService.getSources()) {
                if (req.query.action === 'nextThread') {
                    nextTimestamp = await source.getNextThreadTimestamp(threadId, timestamp);
                } else {
                    nextTimestamp = await source.getPrevThreadTimestamp(threadId, timestamp);
                }
                if (nextTimestamp !== null) break;
            }

            return res.status(200).json({ timestamp: nextTimestamp });
        }

        // Handle existing timeline items endpoint
        const centerTime = parseInt(req.query.center as string);
        const count = parseInt(req.query.count as string) || 50;

        if (isNaN(centerTime)) {
            return res.status(400).json({ error: 'Invalid center timestamp' });
        }

        const items = await timelineService.getTimelineItems(centerTime, count);
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching timeline items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 