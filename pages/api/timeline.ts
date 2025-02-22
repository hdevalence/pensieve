import { NextApiRequest, NextApiResponse } from 'next';
import { TimelineService } from '../../src/services/timeline';

const timelineService = new TimelineService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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