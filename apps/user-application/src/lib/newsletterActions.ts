import { z } from 'zod'

export interface WaitlistSubscribeRequest {
    name: string
    email: string
}

export interface WaitlistSubscribeResponse {
    success: boolean
    message: string
    is_existing?: boolean
}

const subscribeSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
})

// Client-side adapter that calls the API
export const subscribeToWaitlist = async (
    payload: WaitlistSubscribeRequest,
): Promise<WaitlistSubscribeResponse> => {
    // 1. Validate input
    const validationResult = subscribeSchema.safeParse(payload)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map((e) => e.message).join(', ')
        throw new Error(errorMessage)
    }

    // 2. Send to backend (Mocked for now, or point to actual endpoint if available)
    // In a real Vite app, this would likely call a tRPC mutation or a standard API endpoint
    console.log('Subscribing to waitlist:', payload);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success response
    return {
        success: true,
        message: 'You are on the waitlist!',
        is_existing: false
    };
}
