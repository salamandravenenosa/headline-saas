export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        version: string;
        requestId: string;
    };
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    external_id?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Plan {
    id: string;
    name: string;
    stripe_price_id?: string;
    monthly_request_limit: number;
    max_api_keys: number;
    features: Record<string, any>;
}

export interface Subscription {
    id: string;
    organization_id: string;
    plan_id: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    current_period_start: string;
    current_period_end: string;
    plans?: Plan; // For joined queries
}

export interface ApiKey {
    id: string;
    organization_id: string;
    profile_id?: string;
    name: string;
    key_hash: string;
    prefix: string;
    is_active: boolean;
    last_used_at?: string;
    created_at: string;
    deleted_at?: string;
}

export interface UsageMeter {
    organization_id: string;
    monthly_requests_count: number;
    last_reset_at: string;
}

export interface Headline {
    id: string;
    organization_id: string;
    content: string;
    niche?: string;
    style?: string;
    score?: number;
    created_at: string;
}
