import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { WEB_APP_URL } from "../lib/config";
import Logo from "../assets/logo.svg";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const SESSION_QUERY_KEY = ["better-auth", "session"];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.authStateVersion) {
        console.log("[AuthWrapper] authStateVersion changed → invalidate session");
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [queryClient]);

  const showAuthPrompt = !isPending && (!session?.user || !!error);

  if (isPending) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center font-inter bg-background">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showAuthPrompt) {
    return (
      <div className="w-full h-screen flex flex-col relative overflow-hidden font-inter bg-background">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, #ffffff 10%, #06B6D440 50%, #6366F140 90%)",
          }}
        />
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#06B6D4] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-[#6366F1] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 flex-1 flex flex-col items-center justify-center px-6">
          <img
            src={Logo}
            alt="Stepps.ai Logo"
            className="w-16 h-16 object-contain shadow-lg mb-6"
          />
          <h1 className="text-[24px] font-medium text-slate-900 leading-tight text-center max-w-[260px] mb-3">
            Login required to start a recording
          </h1>
          <button
            type="button"
            onClick={() =>
              window.open(`${WEB_APP_URL}/auth/login?from=extension`, "_blank")
            }
            className="w-full max-w-[240px] shadow-xl shadow-indigo-500/20 bg-[#6366F1] hover:bg-[#5558DD] text-white rounded-xl py-3 text-lg font-medium transition-colors"
          >
            Log in to Stepps
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}