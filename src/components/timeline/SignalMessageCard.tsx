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

interface SignalMessageCardProps {
    content: SignalMessageContent;
    timestamp: number;
}

export function SignalMessageCard({ content, timestamp }: SignalMessageCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const date = new Date(timestamp);
    const isOutgoing = content.type === 'outgoing';

    const hasAttachments = Boolean(content.hasVisualMediaAttachments) && content.json?.attachments?.length > 0;

    console.log(content.json?.attachments);

    // Convert attachments to the format expected by the lightbox
    const slides = hasAttachments
        ? content.json.attachments.map((attachment: Attachment): Slide => {
            console.log('Processing attachment:', attachment);
            return {
                src: `/api/signal/attachments/${attachment.path}?` + new URLSearchParams({
                    contentType: attachment.contentType,
                    localKey: attachment.localKey,
                    size: attachment.size.toString()
                }).toString(),
                width: attachment.width,
                height: attachment.height,
            };
        })
        : [];

    return (
        <div className="grid grid-cols-12 gap-4 items-start">
            {/* Timestamp - 2 columns */}
            <div className="col-span-2 text-sm text-gray-400">
                {date.toLocaleTimeString()}
            </div>

            {/* Sender/Group Info - 2 columns */}
            <div className="col-span-2">
                <div className="font-medium text-gray-100 text-sm truncate">
                    {isOutgoing ? content.destName : content.senderName}
                </div>
                {content.groupName && (
                    <div className="text-xs text-gray-400 truncate">
                        {content.groupName}
                    </div>
                )}
            </div>

            {/* Message Content - 6 columns with 2 columns spacing */}
            {isOutgoing && <div className="col-span-2" />}
            <div className="col-span-6">
                <div className={`text-gray-200 p-3 rounded-lg ${isOutgoing
                    ? 'bg-indigo-900/50 ml-auto text-right'
                    : 'bg-gray-700/50'
                    }`}>
                    <div>{content.body}</div>

                    {hasAttachments && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {slides.map((slide: Slide, index: number) => (
                                <div
                                    key={index}
                                    className="cursor-pointer overflow-hidden rounded-lg"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <img
                                        src={slide.src}
                                        alt=""
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {hasAttachments && (
                    <Lightbox
                        open={isOpen}
                        close={() => setIsOpen(false)}
                        slides={slides}
                    />
                )}
            </div>
            {!isOutgoing && <div className="col-span-2" />}
        </div>
    );
} 