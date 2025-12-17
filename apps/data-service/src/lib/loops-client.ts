/**
 * Loops API Client
 *
 * Simple client for sending events to Loops.so
 * Docs: https://loops.so/docs/api-reference
 */

const LOOPS_API_URL = 'https://app.loops.so/api/v1';

export interface LoopsEventProperties {
    [key: string]: string | number | boolean | undefined;
}

export interface SendEventParams {
    email: string;
    eventName: string;
    eventProperties?: LoopsEventProperties;
    contactProperties?: LoopsEventProperties;
    mailingLists?: Record<string, boolean>;
}

export interface CreateContactParams {
    email: string;
    firstName?: string;
    lastName?: string;
    source?: string;
    subscribed?: boolean;
    userGroup?: string;
    userId?: string;
    mailingLists?: Record<string, boolean>;
    [key: string]: string | number | boolean | Record<string, boolean> | undefined;
}

export interface LoopsResponse {
    success: boolean;
    id?: string;
    message?: string;
}

export class LoopsClient {
    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('Loops API key is required');
        }
        this.apiKey = apiKey;
    }

    private async request<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        body?: unknown
    ): Promise<T> {
        const response = await fetch(`${LOOPS_API_URL}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Loops] API Error: ${response.status} - ${errorText}`);
            throw new Error(`Loops API error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Send an event to Loops
     * This is the primary method for triggering Loops workflows
     */
    async sendEvent(params: SendEventParams): Promise<LoopsResponse> {
        console.log(`[Loops] Sending event: ${params.eventName} to ${params.email}`);

        const payload: Record<string, unknown> = {
            email: params.email,
            eventName: params.eventName,
        };

        if (params.eventProperties) {
            payload.eventProperties = params.eventProperties;
        }

        // Contact properties are sent at the root level (except email and eventName)
        if (params.contactProperties) {
            Object.assign(payload, params.contactProperties);
        }

        if (params.mailingLists) {
            payload.mailingLists = params.mailingLists;
        }

        const result = await this.request<LoopsResponse>('/events/send', 'POST', payload);
        console.log(`[Loops] Event sent successfully: ${params.eventName}`);
        return result;
    }

    /**
     * Create or update a contact
     */
    async createContact(params: CreateContactParams): Promise<LoopsResponse> {
        console.log(`[Loops] Creating/updating contact: ${params.email}`);

        const result = await this.request<LoopsResponse>('/contacts/create', 'POST', params);
        console.log(`[Loops] Contact created/updated: ${params.email}`);
        return result;
    }

    /**
     * Find a contact by email
     */
    async findContact(email: string): Promise<unknown[]> {
        console.log(`[Loops] Finding contact: ${email}`);
        const encodedEmail = encodeURIComponent(email);
        return this.request<unknown[]>(`/contacts/find?email=${encodedEmail}`, 'GET');
    }

    /**
     * Check if a contact exists
     */
    async contactExists(email: string): Promise<boolean> {
        const contacts = await this.findContact(email);
        return contacts.length > 0;
    }
}

/**
 * Create a Loops client instance
 */
export function createLoopsClient(apiKey: string): LoopsClient {
    return new LoopsClient(apiKey);
}
