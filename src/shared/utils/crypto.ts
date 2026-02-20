/**
 * Crypto utilities compatible with both Node.js and Edge Runtime.
 * Uses SubtleCrypto for hashing to ensure cross-runtime compatibility.
 */

export async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateApiKey(): { key: string; prefix: string } {
    const prefix = 'sk_live';
    const randomBytes = new Uint8Array(24);
    crypto.getRandomValues(randomBytes);
    const key = `${prefix}_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    return { key, prefix };
}

export function validateApiKeyFormat(key: string): boolean {
    return key.startsWith('sk_live_') && key.length > 20;
}

/**
 * Timing-safe comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}
