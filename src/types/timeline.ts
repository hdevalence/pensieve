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
     * Get items from this source, starting from startTime and returning at most count items,
     * ordered by timestamp (newest first)
     */
    getItems(startTime: number, count: number): Promise<TimelineItem[]>;
} 