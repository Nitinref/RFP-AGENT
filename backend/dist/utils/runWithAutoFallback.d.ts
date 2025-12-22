export declare function runWithAutoFallback({ primaryCall, fallbackCall, confidenceThreshold, }: {
    primaryCall: () => Promise<any>;
    fallbackCall: () => Promise<any>;
    confidenceThreshold?: number;
}): Promise<{
    result: any;
    fallbackUsed: boolean;
    fallbackReason: null;
} | {
    result: any;
    fallbackUsed: boolean;
    fallbackReason: string;
}>;
