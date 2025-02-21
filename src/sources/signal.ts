import { TimelineItem, TimelineSource, SignalMessageContent } from '../types/timeline';
import connectToDatabase from '../../lib/db';

export class SignalMessageSource implements TimelineSource {
    kind = 'signal_message';

    async getItems(startTime: number, count: number): Promise<TimelineItem<SignalMessageContent>[]> {
        const db = await connectToDatabase();

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
            LEFT JOIN conversations pc ON '+' || m.source = pc.e164
            WHERE 
                m.sent_at <= ?
            ORDER BY
                m.sent_at DESC
            LIMIT ?;
        `;

        const stmt = db.prepare(sql);
        const messages = stmt.all(startTime, count);

        return messages.map(msg => ({
            id: msg.id,
            timestamp: msg.sent_at,
            kind: this.kind,
            content: {
                body: msg.body,
                type: msg.type,
                conversationId: msg.conversationId,
                hasVisualMediaAttachments: msg.hasVisualMediaAttachments,
                groupName: msg.groupName,
                senderName: msg.senderName,
                destName: msg.destName,
            },
            metadata: {
                json: msg.json
            }
        }));
    }
} 