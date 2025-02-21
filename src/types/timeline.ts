export interface TimelineItem {
    id: string;
    timestamp: number;  // Unix timestamp in milliseconds
    kind: string;      // e.g., 'signal_message', 'tweet', etc.
    content: any;      // Type varies by kind
    source: string;    // Identifier for the data source
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
    getItems(startTime: number, endTime: number): Promise<TimelineItem[]>;
} 