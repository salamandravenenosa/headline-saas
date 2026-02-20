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

export type DomainEvent = {
    id: string;
    type: string;
    payload: any;
    organizationId?: string;
    userId?: string;
    createdAt: string;
};
