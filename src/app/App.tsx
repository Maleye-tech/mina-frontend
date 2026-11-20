import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { setUnauthorizedHandler } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Toaster } from "../components/ui/Toaster";

export default function App() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      const { user, clearSession } = useAuthStore.getState();
      if (!user) return;
      clearSession();
      const path = router.state.location.pathname;
      if (path.startsWith("/app")) {
        void router.navigate(`/login?redirect=${encodeURIComponent(path)}`);
      }
    });
    void useAuthStore.getState().initialize();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
