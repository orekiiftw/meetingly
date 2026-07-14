import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/lib/auth"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingPage } from "@/pages/LandingPage"
import { FeaturesPage } from "@/pages/FeaturesPage"
import { SecurityPage } from "@/pages/SecurityPage"
import { DashboardPage } from "@/pages/app/DashboardPage"
import { GeneratePage } from "@/pages/app/GeneratePage"
import { SettingsPage } from "@/pages/app/SettingsPage"
import { SignInPage } from "@/pages/auth/SignInPage"
import { SignUpPage } from "@/pages/auth/SignUpPage"
import { NotFoundPage } from "@/pages/NotFoundPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing site */}
          <Route element={<MarketingLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>

          {/* Auth */}
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />

          {/* Product app shell (requires login) */}
          <Route path="app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="generate" element={<GeneratePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Back-compat */}
          <Route
            path="workspace"
            element={<Navigate to="/app/generate" replace />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
