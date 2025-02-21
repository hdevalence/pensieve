import { NextApiRequest, NextApiResponse } from 'next';
import { TimelineService } from '@/services/timeline';

const timelineService = new TimelineService();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ error: 'Missing start or end timestamp' });
        }

        const startTime = parseInt(start as string);
        const endTime = parseInt(end as string);

        if (isNaN(startTime) || isNaN(endTime)) {
            return res.status(400).json({ error: 'Invalid timestamp format' });
        }

        const items = await timelineService.getTimelineItems(startTime, endTime);
        res.status(200).json(items);
    } catch (error) {
        console.error('Timeline API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 