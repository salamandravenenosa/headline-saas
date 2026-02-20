import { redis } from './redis';

export async function pushToQueue(queueName: string, payload: any) {
    const job = {
        id: crypto.randomUUID(),
        payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    // Push to a list and set metadata
    await redis.lpush(`queue:${queueName}`, job.id);
    await redis.set(`job:${job.id}`, JSON.stringify(job));

    return job.id;
}

export async function getJobStatus(jobId: string) {
    const data = await redis.get(`job:${jobId}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

export async function updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed', result?: any, error?: string) {
    const data = await getJobStatus(jobId);
    if (!data) return;

    const updatedJob = {
        ...data,
        status,
        result,
        error,
        updatedAt: new Date().toISOString(),
    };

    await redis.set(`job:${jobId}`, JSON.stringify(updatedJob));
}
