export interface TimelineItem<T = unknown> {
    id: string;
    timestamp: number;  // Unix timestamp in milliseconds
    kind: string;      // e.g., 'signal_message', 'tweet', etc.
    content: T;
    metadata: {
        [key: string]: any;
    };
}

export interface SignalMessageContent {
    body: string;
    type: string;
    conversationId: string;
    hasVisualMediaAttachments: boolean;
    groupName?: string;
    senderName: string;
    destName: string;
}

export interface TimelineSource {
    kind: string;
    /**
     * Get items from this source, starting from startTime and returning at most count items,
     * ordered by timestamp (newest first)
     */
    getItems(startTime: number, count: number): Promise<TimelineItem[]>;
} 