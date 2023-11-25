import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dayjs from 'dayjs';
import connectToDatabase from '../../lib/db';
import ImageGallery from 'react-image-gallery';
import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import CryptoJS from 'crypto-js';

// Assuming a simple message type, adjust according to your database schema
type MessageType = {
    id: number;
    sent_at: number;
    type: string;
    body: string;
    json: string;
    conversationId: string;
    hasVisualMediaAttachments: boolean;
    groupName?: string,
    senderName: string,
    destName: string,
};

interface Attachment {
    contentType: string;
    key: string;
    size: number;
    digest: string;
    fileName: string;
    flags: number;
    width: number;
    height: number;
    blurHash: string;
    uploadTimestamp: number;
    cdnNumber: number;
    cdnKey: string;
    path: string;
    thumbnail: {
        path: string;
        contentType: string;
        width: number;
        height: number;
    };
}

// Fetch data for each request
export const getServerSideProps: GetServerSideProps = async (context) => {
    const date = context.params?.date as string;

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
    const messages = stmt.all(date); // Assuming 'date' variable holds the desired date

    return {
        props: {
            messages,
        },
    };
};

function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // or false if you want 24-hour time
    }).format(date);
}

function generateBackgroundColor(conversationId: string): string {
    const hash = CryptoJS.SHA256(conversationId);
    const hashString = hash.toString(CryptoJS.enc.Hex);
    const hashInt = parseInt(hashString.substring(1 + 0, 1 + 8), 16);
    const hue = hashInt % 360;
    return `hsl(${hue}, 80%, 15%)`;
}

type MessageRowProps = {
    message: MessageType;
};

const MessageRow: React.FC<MessageRowProps> = ({ message }) => {
    return (
        <div className="px-4 my-1 grid grid-cols-12 items-start" style={{ backgroundColor: generateBackgroundColor(message.conversationId) }}>
            {/* DateTime Column */}
            <div className="col-span-2">
                <span className="block text-xs">{formatDate(message.sent_at)}</span>
            </div>

            <SenderName message={message} />
            <MessageBody message={message} />
        </div>
    );
};


type SenderNameProps = {
    message: MessageType;
};

const SenderName: React.FC<SenderNameProps> = ({ message }) => (
    <div className="col-span-2">
        {message.groupName ? (
            <div className="flex flex-col">
                <span className="text-sm">{message.groupName}</span>
                <span className="text-sm italic">{message.senderName}</span>
            </div>
        ) : (
            <span className="block text-sm italic">{message.type === 'incoming' ? message.senderName : message.destName}</span>
        )}
    </div>
);

type MessageBodyProps = {
    message: MessageType;
};


const MessageBody: React.FC<MessageBodyProps> = ({ message }) => {
    const attachments: Attachment[] = message.hasVisualMediaAttachments ? JSON.parse(message.json).attachments : [];

    // Regex to find Twitter or X.com URLs
    const twitterUrlRegex = /https:\/\/(twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
    const match = message.body?.match(twitterUrlRegex);

    return (
        <div className={`col-span-6 ${message.type === 'outgoing' ? 'col-start-7 text-right' : ''}`}>
            <p className="text-sm">{message.body}</p>
            {message.hasVisualMediaAttachments ? (<PhotoGallery attachments={attachments} />) : null}
            {match ? <TwitterTweetEmbed options={{ theme: "dark" }} tweetId={match[2]} /> : null}
        </div>
    );
};

type PhotoGalleryProps = {
    attachments: Attachment[];
};

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ attachments }) => {
    const images = attachments.map((attachment) => ({
        original: `/attachments/${attachment.path}`,
        thumbnail: `/attachments/${attachment.thumbnail.path}`,
        originalHeight: attachment.height,
        originalWidth: attachment.width,
        thumbnailHeight: attachment.thumbnail.height,
        thumbnailWidth: attachment.thumbnail.width,
        // You can add more fields as needed, like descriptions or titles
    }));

    // Determine whether to show thumbnails
    const showThumbnails = images.length > 1;

    return <ImageGallery items={images} slideDuration={0} showThumbnails={showThumbnails} useBrowserFullscreen={false} thumbnailPosition={"top"} />;
};

type MessagesListProps = {
    messages: MessageType[];
};

const MessagesList: React.FC<MessagesListProps> = ({ messages }) => (
    <div>
        {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
        ))}
    </div>
);

type NavigationLinksProps = {
    currentDay: string;
};

const NavigationLinks: React.FC<NavigationLinksProps> = ({ currentDay }) => {
    const previousDay = dayjs(currentDay).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDay = dayjs(currentDay).add(1, 'day').format('YYYY-MM-DD');

    return (
        <div className="grid grid-cols-12">
            <div className="m-4 text-xl col-span-2">
                <Link href={`/messages/${previousDay}`}>
                    Previous Day
                </Link>
            </div>
            <div className="m-4 text-xl col-span-4 col-start-5 text-center">
                {currentDay}
            </div>
            <div className="m-4 text-xl col-start-11 col-span-2 text-right">
                <Link href={`/messages/${nextDay}`}>
                    Next Day
                </Link>
            </div>
        </div>
    );
};


// Page component
const DatePage: React.FC<{ messages: MessageType[] }> = ({ messages }) => {
    const router = useRouter();
    const { date } = router.query as { date: string };

    const previousDay = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    const nextDay = dayjs(date).add(1, 'day').format('YYYY-MM-DD');

    return (
        <div className="mx-auto max-w-4xl">
            <NavigationLinks currentDay={date} />
            <MessagesList messages={messages} />
            <NavigationLinks currentDay={date} />
        </div >
    );
};

export default DatePage;
