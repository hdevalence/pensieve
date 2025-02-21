
// TODO remove? 

import connectToDatabase from '../../lib/db';

export async function getMessagesByDate(date: string) {
    const db = await connectToDatabase();

    console.log(date);

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
      COALESCE(sender.profileFullName, sender.name, sender.e164, 'Unknown') AS senderName,
      COALESCE(c.profileFullName, c.name, c.e164, 'Unknown') AS destName
    FROM
      messages m
    LEFT JOIN conversations c ON m.conversationId = c.id
    LEFT JOIN conversations sender ON m.source = sender.e164 OR m.sourceServiceId = sender.serviceId
    WHERE 
      date(m.sent_at / 1000, 'unixepoch', 'localtime') = ?
    ORDER BY
      m.sent_at;
  `;

    const stmt = db.prepare(sql);
    const messages = stmt.all(date);
    console.log(messages.slice(0, 10));

    return messages;
} 