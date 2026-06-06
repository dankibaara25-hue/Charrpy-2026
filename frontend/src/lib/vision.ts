// Vision verification client. Sends a base64-encoded photo to the backend
// vision route to check whether the user actually photographed the target
// object. Used by the photo wake-up challenge.

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";

export interface VerifyObjectResponse {
  match: boolean;
  confidence: number;
  reasoning: string;
}

export async function verifyObject(input: {
  imageBase64: string;
  target: string;
  targetId?: string;
  signal?: AbortSignal;
}): Promise<VerifyObjectResponse> {
  const url = `${BASE}/api/vision/verify-object`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_base64: input.imageBase64,
      target_object: input.target,
      target_id: input.targetId,
    }),
    signal: input.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`vision API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as VerifyObjectResponse;
}
