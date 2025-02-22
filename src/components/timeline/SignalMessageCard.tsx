import { SignalMessageContent } from '../../types/timeline';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useState } from 'react';
import Link from 'next/link';

interface Attachment {
    contentType: string;
    width: number;
    height: number;
    path: string;
    localKey: string;
    iv: string;
    thumbnail?: {
        path: string;
        width: number;
        height: number;
        localKey: string;
        iv: string;
    };
    size: number;
}

interface Slide {
    src: string;
    width: number;
    height: number;
}

interface MessageItem {
    content: SignalMessageContent;
    timestamp: number;
}

interface SignalMessageCardProps {
    items: MessageItem[];
}

export function SignalMessageCard({ items }: SignalMessageCardProps) {
    const [openLightboxIndex, setOpenLightboxIndex] = useState<number | null>(null);
    const [hoveredSender, setHoveredSender] = useState<string | null>(null);

    const handleTimestampClick = (timestamp: number) => {
        window.location.href = `/messages#t=${timestamp}`;
        window.location.reload();
    };

    const handleHideThread = (conversationId: string, timestamp: number) => {
        const threadId = `signal-${conversationId}`;
        const hidden = localStorage.getItem('hiddenThreads');
        const hiddenThreads = hidden ? JSON.parse(hidden) : [];
        hiddenThreads.push(threadId);
        localStorage.setItem('hiddenThreads', JSON.stringify(hiddenThreads));
        window.location.href = `/messages#t=${timestamp}`;
        window.location.reload();
    };

    return (
        <div className="">
            {/* Messages */}
            {items.map((item, index) => {
                const { content, timestamp } = item;
                const date = new Date(timestamp);
                const isOutgoing = content.type === 'outgoing';
                const hasAttachments = Boolean(content.hasVisualMediaAttachments) && content.json?.attachments?.length > 0;

                // Determine whether to show the sender name based on new logic
                const isFirstMessage = index === 0;
                const showSenderName = content.groupName
                    ? !isOutgoing  // Always show sender name in groups for incoming messages
                    : isFirstMessage;  // Only show name for first message in direct conversations

                // Convert attachments to slides if present
                const slides = hasAttachments
                    ? content.json.attachments.map((attachment: Attachment): Slide => ({
                        src: `/api/signal/attachments/${attachment.path}?` + new URLSearchParams({
                            contentType: attachment.contentType,
                            localKey: attachment.localKey,
                            size: attachment.size.toString()
                        }).toString(),
                        width: attachment.width,
                        height: attachment.height,
                    }))
                    : [];

                return (
                    <div key={index} className="grid grid-cols-12 items-start">
                        {/* Timestamp - 2 columns */}
                        <div className="col-span-2 text-xs text-gray-400">
                            <button
                                onClick={() => handleTimestampClick(timestamp)}
                                className="hover:text-gray-200 transition-colors"
                            >
                                {date.toLocaleString()}
                            </button>
                        </div>

                        {/* Sender Info - 2 columns */}
                        <div className="col-span-3">
                            {showSenderName && (
                                <div className="flex items-center">
                                    <button
                                        onClick={async () => {
                                            const response = await fetch(
                                                `/api/timeline?action=prevThread&threadId=signal-${content.conversationId}&timestamp=${timestamp}`
                                            );
                                            if (response.ok) {
                                                const data = await response.json();
                                                if (data.timestamp !== null) {
                                                    handleTimestampClick(data.timestamp);
                                                }
                                            }
                                        }}
                                        className="text-gray-400 hover:text-gray-200 transition-colors p-0 leading-none"
                                        title="Previous message in thread"
                                    >
                                        ⬆️
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const response = await fetch(
                                                `/api/timeline?action=nextThread&threadId=signal-${content.conversationId}&timestamp=${timestamp}`
                                            );
                                            if (response.ok) {
                                                const data = await response.json();
                                                if (data.timestamp !== null) {
                                                    handleTimestampClick(data.timestamp);
                                                }
                                            }
                                        }}
                                        className="text-gray-400 hover:text-gray-200 transition-colors p-0 leading-none"
                                        title="Next message in thread"
                                    >
                                        ⬇️
                                    </button>
                                    <div className="px-2 font-medium text-gray-100 text-sm truncate">
                                        <div
                                            className="group relative inline-block"
                                            onMouseEnter={() => setHoveredSender(content.conversationId)}
                                            onMouseLeave={() => setHoveredSender(null)}
                                        >
                                            {hoveredSender === content.conversationId ? (
                                                <button
                                                    onClick={() => handleHideThread(content.conversationId, timestamp)}
                                                    className="text-gray-400 hover:text-gray-200 transition-colors"
                                                >
                                                    Hide thread
                                                </button>
                                            ) : (
                                                content.groupName ? (
                                                    <>
                                                        <strong>{content.groupName}</strong> [{content.senderName}]
                                                    </>
                                                ) : (
                                                    isOutgoing ? content.destName : content.senderName
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Content - 6 columns with 2 columns spacing */}
                        {isOutgoing && <div className="col-span-2" />}
                        <div
                            className={`col-span-5 text-gray-200 text-sm px-2 ${isOutgoing ? 'text-right' : ''}`}
                        >
                            <div>{content.body}</div>
                            {hasAttachments && (
                                <div
                                    className={`mt-2 flex flex-wrap gap-2 ${isOutgoing ? 'justify-end' : ''}`}
                                >
                                    {slides.map((slide: Slide, slideIndex: number) => (
                                        <img
                                            key={slideIndex}
                                            src={slide.src}
                                            alt=""
                                            onClick={() => setOpenLightboxIndex(index)}
                                            className="max-w-72 max-h-72 h-auto object-cover rounded-lg cursor-pointer"
                                        />
                                    ))}
                                </div>
                            )}
                            {hasAttachments && openLightboxIndex === index && (
                                <Lightbox
                                    open={true}
                                    close={() => setOpenLightboxIndex(null)}
                                    slides={slides}
                                />
                            )}
                        </div>
                        {!isOutgoing && <div className="col-span-2" />}
                    </div>
                );
            })}
        </div>
    );
} 