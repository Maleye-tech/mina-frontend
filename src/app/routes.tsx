import { createBrowserRouter, Navigate } from "react-router";
import { PublicLayout } from "../components/layout/PublicLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { InfoPage, ErrorPage } from "../pages/public/InfoPages";
import { HydratingScreen, ProtectedRoute, RoleGuard } from "../routes/guards";
import { CareLayout } from "../components/care/CareLayout";

export const router = createBrowserRouter([
  {
    Component: PublicLayout,
    HydrateFallback: HydratingScreen,
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
    path: "partner/dashboard",
    element: <Navigate to="/app/partner" replace />,
  },
  {
    path: "login",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).LoginPage }),
  },
  {
    path: "register",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).RegisterPage }),
  },
  {
    path: "forgot-password",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).ForgotPasswordPage }),
  },
  {
    path: "reset-password",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).ResetPasswordPage }),
  },
  {
    path: "verify-email/:id/:hash",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).VerifyEmailPage }),
  },
  {
    path: "two-factor",
    HydrateFallback: HydratingScreen,
    lazy: async () => ({ Component: (await import("../pages/auth/AuthPages")).TwoFactorPage }),
  },
  {
    path: "pro",
    Component: ProtectedRoute,
    HydrateFallback: HydratingScreen,
    children: [
      {
        Component: CareLayout,
        children: [
          {
            element: <RoleGuard role="professional" />,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import("../pages/care/professional/ProfessionalDashboardPage"))
                    .ProfessionalDashboardPage,
                }),
              },
              {
                path: "onboarding",
                lazy: async () => ({
                  Component: (await import("../pages/care/professional/ProfessionalOnboardingPage"))
                    .ProfessionalOnboardingPage,
                }),
              },
              {
                path: "disponibilites",
                lazy: async () => ({
                  Component: (
                    await import("../pages/care/professional/ProfessionalAvailabilityPage")
                  ).ProfessionalAvailabilityPage,
                }),
              },
              {
                path: "demandes",
                lazy: async () => ({
                  Component: (await import("../pages/care/professional/ProfessionalRequestsPage"))
                    .ProfessionalRequestsPage,
                }),
              },
              {
                path: "rendez-vous/:id",
                lazy: async () => ({
                  Component: (
                    await import("../pages/care/professional/ProfessionalAppointmentPage")
                  ).ProfessionalAppointmentPage,
                }),
              },
              {
                path: "alertes",
                lazy: async () => ({
                  Component: (await import("../pages/care/professional/ProfessionalAlertsPage"))
                    .ProfessionalAlertsPage,
                }),
              },
              { path: "*", element: <Navigate to="/pro" replace /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "espace",
    Component: ProtectedRoute,
    HydrateFallback: HydratingScreen,
    children: [
      {
        Component: CareLayout,
        children: [
          {
            element: <RoleGuard role="student" />,
            children: [
              { index: true, element: <Navigate to="/espace/accompagnement" replace /> },
              {
                path: "accompagnement",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareCataloguePage"))
                    .CareCataloguePage,
                }),
              },
              {
                path: "accompagnement/:id",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareProfessionalDetailPage"))
                    .CareProfessionalDetailPage,
                }),
              },
              {
                path: "rendez-vous",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareAppointmentsPage"))
                    .CareAppointmentsPage,
                }),
              },
              {
                path: "rendez-vous/:id",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareAppointmentDetailPage"))
                    .CareAppointmentDetailPage,
                }),
              },
              {
                path: "consentement",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareConsentPage"))
                    .CareConsentPage,
                }),
              },
              {
                path: "anonymat",
                lazy: async () => ({
                  Component: (await import("../pages/care/student/CareConsentPage"))
                    .CareConsentPage,
                }),
              },
              { path: "*", element: <Navigate to="/espace/accompagnement" replace /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "app",
    Component: ProtectedRoute,
    HydrateFallback: HydratingScreen,
    children: [
      {
        Component: DashboardLayout,
        children: [
          {
            element: <RoleGuard role="student" />,
            children: [
              {
                path: "student/onboarding",
                lazy: async () => ({
                  Component: (await import("../pages/app/student/OnboardingPage")).OnboardingPage,
                }),
              },
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
                element: <Navigate to="/pro" replace />,
              },
            ],
          },
          {
            element: <RoleGuard role={["partner", "partner_admin"]} />,
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
