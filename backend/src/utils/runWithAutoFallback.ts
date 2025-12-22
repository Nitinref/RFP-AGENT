export async function runWithAutoFallback({
  primaryCall,
  fallbackCall,
  confidenceThreshold = 0.6,
}: {
  primaryCall: () => Promise<any>;
  fallbackCall: () => Promise<any>;
  confidenceThreshold?: number;
}) {
  try {
    const primaryResult = await primaryCall();

    if (
      primaryResult?.confidence !== undefined &&
      primaryResult.confidence < confidenceThreshold
    ) {
      throw new Error("Low confidence from primary model");
    }

    return {
      result: primaryResult,
      fallbackUsed: false,
      fallbackReason: null,
    };
  } catch (err) {
    const fallbackResult = await fallbackCall();

    return {
      result: fallbackResult,
      fallbackUsed: true,
      fallbackReason:
        err instanceof Error ? err.message : "unknown",
    };
  }
}
