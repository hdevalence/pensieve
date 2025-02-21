import connectToDatabase from '../../lib/db';

export async function getMessagesByDate(date: string) {
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
      date(m.sent_at / 1000, 'unixepoch', 'localtime') = ?
    ORDER BY
      m.sent_at;
  `;

    const stmt = db.prepare(sql);
    const messages = stmt.all(date);
    console.log(messages.slice(0, 10));

    return messages;
} 