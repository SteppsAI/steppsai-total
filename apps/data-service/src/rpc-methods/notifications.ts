import { sendFeedbackEmail } from "../helpers/mail";

export async function sendFeedback(
    env: Env,
    data: {
        email: string;
        name: string;
        subject: string;
        type: string;
        message: string;
    }
) {
    return sendFeedbackEmail(env, data);
}
