import { createBrowserRouter } from "react-router";
import { PublicLayout } from "../components/layout/PublicLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { InfoPage, ErrorPage } from "../pages/public/InfoPages";
import { ProtectedRoute, RoleGuard } from "../routes/guards";

export const router = createBrowserRouter([
  {
    Component: PublicLayout,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../pages/public/LandingPage")).LandingPage,
        }),
      },
      { path: "mina-care", Component: InfoPage },
      { path: "tarifs", Component: InfoPage },
      { path: "partenaires", Component: InfoPage },
      { path: "contact", Component: InfoPage },
      { path: "403", element: <ErrorPage forbidden /> },
    ],
  },
  {
    path: "login",
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).LoginPage }),
  },
  {
    path: "register",
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).RegisterPage }),
  },
  {
    path: "forgot-password",
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).ForgotPasswordPage }),
  },
  {
    path: "app",
    Component: ProtectedRoute,
    children: [
      {
        Component: DashboardLayout,
        children: [
          {
            element: <RoleGuard role="student" />,
            children: [
              {
                path: "student/*",
                lazy: async () => ({
                  Component: (await import("../pages/app/RolePages")).StudentDashboard,
                }),
              },
            ],
          },
          {
            element: <RoleGuard role="ambassador" />,
            children: [
              {
                path: "ambassador/*",
                lazy: async () => ({
                  Component: (await import("../pages/app/RolePages")).AmbassadorDashboard,
                }),
              },
            ],
          },
          {
            element: <RoleGuard role="professional" />,
            children: [
              {
                path: "professional/*",
                lazy: async () => ({
                  Component: (await import("../pages/app/RolePages")).ProfessionalDashboard,
                }),
              },
            ],
          },
          {
            element: <RoleGuard role="partner_admin" />,
            children: [
              {
                path: "partner/*",
                lazy: async () => ({
                  Component: (await import("../pages/app/RolePages")).PartnerDashboard,
                }),
              },
            ],
          },
          {
            element: <RoleGuard role="super_admin" />,
            children: [
              {
                path: "admin/*",
                lazy: async () => ({
                  Component: (await import("../pages/app/RolePages")).AdminDashboard,
                }),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", Component: ErrorPage },
]);
