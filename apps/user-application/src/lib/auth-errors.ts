import { toast } from "sonner";

type ErrorContext = {
  error?: { code?: string; message?: string };
  responseText?: string;
  // Allow any other fields without typing everything
  [key: string]: unknown;
};

type AuthMode = "login" | "signup";

export const showAuthError = (ctx: ErrorContext | undefined, mode: AuthMode) => {
  let code: string | undefined;
  let message: string | undefined;

  if (ctx?.error) {
    code = (ctx.error as any).code;
    message = ctx.error.message;
  }

  if (!code && typeof ctx?.responseText === "string") {
    try {
      const parsed = JSON.parse(ctx.responseText);
      code = parsed.code ?? code;
      message = parsed.message ?? message;
    } catch {
      // ignore JSON parse errors
    }
  }

  let userMessage =
    "Something went wrong, try later. If the problem persist, please contact us.";

  if (code === "INVALID_EMAIL_OR_PASSWORD" && mode === "login") {
    userMessage =
      "We couldn't find an account with these credentials. Please check your email and password or create an account.";
  }

  if (code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" && mode === "signup") {
    userMessage =
      "An account already exists with this email. Please sign in instead.";
  }

  console.error("[Auth] handled error", { code, message, ctx });
  toast.error(userMessage);
};


