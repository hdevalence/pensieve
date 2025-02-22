import { SignalMessageContent } from '../../types/timeline';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useState } from 'react';

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
                const theirName = isOutgoing ? content.destName : content.senderName;

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
                        <div className="col-span-2 text-sm text-gray-400">
                            {date.toLocaleString()}
                        </div>

                        {/* Sender Info - 2 columns */}
                        <div className="col-span-2">
                            {showSenderName && (
                                <div className="font-medium text-gray-100 text-sm truncate">
                                    {content.groupName ? (
                                        <>
                                            <strong>{content.groupName}</strong> [{content.senderName}]
                                        </>
                                    ) : (
                                        isOutgoing ? content.destName : content.senderName
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Message Content - 6 columns with 2 columns spacing */}
                        {isOutgoing && <div className="col-span-2" />}
                        <div
                            className={`col-span-6 text-gray-200 px-2 ${isOutgoing ? 'text-right' : ''
                                }`}
                        >
                            <div>{content.body}</div>
                            {hasAttachments && (
                                <div
                                    className={`mt-2 flex flex-wrap gap-2 ${isOutgoing ? 'justify-end' : ''
                                        }`}
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