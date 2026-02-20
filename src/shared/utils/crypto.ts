import crypto from 'crypto';

export function generateApiKey(): { key: string; hash: string; prefix: string } {
    const prefix = 'sk_live';
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const key = `${prefix}_${randomBytes}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}

export function validateApiKeyFormat(key: string): boolean {
    return key.startsWith('sk_live_') && key.length > 20;
}

/**
 * Timing-safe comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
