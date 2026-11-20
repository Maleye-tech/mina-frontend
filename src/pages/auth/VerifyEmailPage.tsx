import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Logo } from "../../components/ui/Logo";

type Status =
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function VerifyEmailPage() {
  const { id = "", hash = "" } = useParams();
  const location = useLocation();
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { authService } = await import("../../services/authService");
      try {
        const message = await authService.verifyEmail(id, hash, location.search);
        if (!cancelled) setStatus({ state: "success", message });
      } catch (e) {
        if (!cancelled) setStatus({ state: "error", message: (e as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, hash, location.search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 dark:bg-[#09111f]">
      <div className="w-full max-w-md rounded-[26px] border border-line bg-white p-8 text-center shadow-card dark:border-white/8 dark:bg-panel">
        <Logo />
        <div className="mt-8 flex justify-center">
          {status.state === "loading" && (
            <LoaderCircle className="animate-spin text-mina" size={34} />
          )}
          {status.state === "success" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-mina dark:bg-mina/10">
              <CheckCircle2 size={28} />
            </div>
          )}
          {status.state === "error" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
              <AlertCircle size={28} />
            </div>
          )}
        </div>
        <h1 className="mt-6 text-xl font-extrabold">
          {status.state === "loading"
            ? "Vérification de ton adresse…"
            : status.state === "success"
              ? "Adresse e-mail vérifiée"
              : "Lien invalide ou expiré"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {status.state === "loading"
            ? "Un instant, nous confirmons ton inscription."
            : status.message}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-mina px-5 py-3 text-sm font-bold text-white"
        >
          Aller à la connexion
        </Link>
      </div>
    </div>
  );
}
