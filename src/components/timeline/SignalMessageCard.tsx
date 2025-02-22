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

    // All messages in a thread should have the same conversation details
    const firstItem = items[0];
    const { groupName, type: firstMessageType } = firstItem.content;

    // Determine the header name based on whether it's a group or direct message
    const headerName = groupName || (firstMessageType === 'outgoing'
        ? firstItem.content.destName
        : firstItem.content.senderName);

    return (
        <div className="">
            {/* Thread header - always present */}
            <div className="grid grid-cols-12 items-start">
                <div className="col-span-2" />
                <div className="col-span-2">
                    <div className="font-medium text-gray-300 text-sm">
                        {groupName ? <i>{headerName}</i> : headerName}
                    </div>
                </div>
                <div className="col-span-8" />
            </div>

            {/* Messages */}
            {items.map((item, index) => {
                const { content, timestamp } = item;
                const date = new Date(timestamp);
                const isOutgoing = content.type === 'outgoing';
                const hasAttachments = Boolean(content.hasVisualMediaAttachments) && content.json?.attachments?.length > 0;

                // Determine whether to show the sender name
                const showSenderName = groupName ? !isOutgoing : false;

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
                            {date.toLocaleTimeString()}
                        </div>

                        {/* Sender Info - 2 columns */}
                        <div className="col-span-2">
                            {showSenderName && (
                                <div className="font-medium text-gray-100 text-sm truncate">
                                    {content.senderName}
                                </div>
                            )}
                        </div>

                        {/* Message Content - 6 columns with 2 columns spacing */}
                        {isOutgoing && <div className="col-span-2" />}
                        <div className="col-span-6">
                            <div className={`text-gray-200 px-2 ${isOutgoing
                                ? 'ml-auto text-right'
                                : ''
                                }`}>
                                <div>{content.body}</div>

                                {hasAttachments && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {slides.map((slide: Slide, slideIndex: number) => (
                                            <div
                                                key={slideIndex}
                                                className="cursor-pointer overflow-hidden rounded-lg"
                                                onClick={() => setOpenLightboxIndex(index)}
                                            >
                                                <img
                                                    src={slide.src}
                                                    alt=""
                                                    className="w-full h-auto max-h-72 object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

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