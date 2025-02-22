export interface TimelineItem<T = unknown> {
    id: string;
    timestamp: number;  // Unix timestamp in milliseconds
    kind: string;      // e.g., 'signal_message', 'tweet', etc.
    content: T;
    threadId: string;  // Identifier for grouping related items together
}

export interface SignalMessageContent {
    body: string;
    type: 'incoming' | 'outgoing';
    conversationId: string;
    hasVisualMediaAttachments: boolean;
    groupName?: string;
    senderName: string;
    destName: string;
    json: any;
}

export interface TimelineSource {
    kind: string;
    /**
     * Get items from this source that occur after startTime, returning at most count items,
     * ordered by timestamp (oldest first)
     */
    getNextItems(startTime: number, count: number): Promise<TimelineItem[]>;

    /**
     * Get items from this source that occur before startTime, returning at most count items,
     * ordered by timestamp (oldest first)
     */
    getPrevItems(startTime: number, count: number): Promise<TimelineItem[]>;

    /**
     * Get the timestamp of the next item in a thread after the given timestamp
     * Returns null if there is no next item or if the thread doesn't belong to this source
     */
    getNextThreadTimestamp(threadId: string, timestamp: number): Promise<number | null>;

    /**
     * Get the timestamp of the previous item in a thread before the given timestamp
     * Returns null if there is no previous item or if the thread doesn't belong to this source
     */
    getPrevThreadTimestamp(threadId: string, timestamp: number): Promise<number | null>;
} 