import { TimelineItem, TimelineSource, SignalMessageContent } from '../types/timeline';
import connectToDatabase from '../../lib/db';

export class SignalMessageSource implements TimelineSource {
    kind = 'signal_message';

    private async queryMessages(sql: string, params: any[]): Promise<TimelineItem<SignalMessageContent>[]> {
        const db = await connectToDatabase();
        const stmt = db.prepare(sql);
        const messages = stmt.all(...params);

        // Debug logging for timestamps
        console.log('Query parameters:', params);
        console.log('Message timestamps in order:');
        messages.slice(0, 10).forEach((msg, i) => {
            console.log(`${i}: ${new Date(msg.sent_at).toISOString()} (${msg.sent_at})`);
        });

        return messages.map(msg => ({
            id: msg.id,
            timestamp: msg.sent_at,
            kind: this.kind,
            threadId: `signal-${msg.conversationId}`,
            content: {
                type: msg.type,
                body: msg.body,
                conversationId: msg.conversationId,
                hasVisualMediaAttachments: msg.hasVisualMediaAttachments,
                groupName: msg.groupName,
                senderName: msg.senderName,
                destName: msg.destName,
                json: msg.json ? JSON.parse(msg.json) : null
            },
        }));
    }

    async getNextItems(startTime: number, count: number): Promise<TimelineItem<SignalMessageContent>[]> {
        const sql = `
            SELECT
                m.id,
                m.sent_at,
                m.type,
                m.body,
                m.json,
                m.conversationId,
                m.hasVisualMediaAttachments,
                CASE
                    WHEN c.type = 'group' THEN c.name
                    ELSE NULL
                END AS groupName,
                COALESCE(pc.profileFullName, 'Unknown') AS senderName,
                COALESCE(c.profileFullName, 'Unknown') AS destName
            FROM
                messages m
            LEFT JOIN conversations c ON m.conversationId = c.id
            LEFT JOIN conversations pc ON m.sourceServiceId = pc.serviceId
            WHERE 
                m.sent_at >= ?
            ORDER BY
                m.sent_at ASC
            LIMIT ?;
        `;

        return this.queryMessages(sql, [startTime, count]);
    }

    async getPrevItems(startTime: number, count: number): Promise<TimelineItem<SignalMessageContent>[]> {
        const sql = `
            SELECT
                m.id,
                m.sent_at,
                m.type,
                m.body,
                m.json,
                m.conversationId,
                m.hasVisualMediaAttachments,
                CASE
                    WHEN c.type = 'group' THEN c.name
                    ELSE NULL
                END AS groupName,
                COALESCE(pc.profileFullName, 'Unknown') AS senderName,
                COALESCE(c.profileFullName, 'Unknown') AS destName
            FROM
                messages m
            LEFT JOIN conversations c ON m.conversationId = c.id
            LEFT JOIN conversations pc ON m.sourceServiceId = pc.serviceId
            WHERE 
                m.sent_at < ?
            ORDER BY
                m.sent_at DESC
            LIMIT ?;
        `;

        // Query in DESC order to get the most recent N items before the timestamp,
        // then reverse the results to maintain oldest-first ordering
        const results = await this.queryMessages(sql, [startTime, count]);
        return results.reverse();
    }

    async getNextThreadTimestamp(threadId: string, timestamp: number): Promise<number | null> {
        // Check if this is a signal thread
        if (!threadId.startsWith('signal-')) {
            return null;
        }

        // Extract the conversation ID from the thread ID
        const conversationId = threadId.replace('signal-', '');

        const db = await connectToDatabase();
        const sql = `
            SELECT sent_at
            FROM messages
            WHERE conversationId = ?
            AND sent_at > ?
            ORDER BY sent_at ASC
            LIMIT 1;
        `;
        const stmt = db.prepare(sql);
        const result = stmt.get(conversationId, timestamp);

        return result ? result.sent_at : null;
    }

    async getPrevThreadTimestamp(threadId: string, timestamp: number): Promise<number | null> {
        // Check if this is a signal thread
        if (!threadId.startsWith('signal-')) {
            return null;
        }

        // Extract the conversation ID from the thread ID
        const conversationId = threadId.replace('signal-', '');

        const db = await connectToDatabase();
        const sql = `
            SELECT sent_at
            FROM messages
            WHERE conversationId = ?
            AND sent_at < ?
            ORDER BY sent_at DESC
            LIMIT 1;
        `;
        const stmt = db.prepare(sql);
        const result = stmt.get(conversationId, timestamp);

        return result ? result.sent_at : null;
    }
} 