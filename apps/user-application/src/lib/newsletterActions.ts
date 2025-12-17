import { z } from 'zod'
import { trpcClient } from './trpc-client'

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

/**
 * Subscribe to waitlist via tRPC
 * Sends event to Loops for confirmation email
 */
export const subscribeToWaitlist = async (
    payload: WaitlistSubscribeRequest,
): Promise<WaitlistSubscribeResponse> => {
    // Validate input
    const validationResult = subscribeSchema.safeParse(payload)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map((e) => e.message).join(', ')
        throw new Error(errorMessage)
    }

    // Call tRPC endpoint
    const result = await trpcClient.webinar.joinWaitlist.mutate({
        email: payload.email,
        name: payload.name,
    })

    return {
        success: result.success,
        message: result.message,
        is_existing: result.is_existing,
    }
}

/**
 * Register for webinar via tRPC
 * Sends event to Loops for confirmation email and starts reminder workflow
 */
export const subscribeToWebinar = async (
    payload: WaitlistSubscribeRequest,
): Promise<WaitlistSubscribeResponse> => {
    // Validate input
    const validationResult = subscribeSchema.safeParse(payload)
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map((e) => e.message).join(', ')
        throw new Error(errorMessage)
    }

    // Call tRPC endpoint
    const result = await trpcClient.webinar.register.mutate({
        email: payload.email,
        name: payload.name,
    })

    return {
        success: result.success,
        message: result.message,
        is_existing: result.is_existing,
    }
}
