import { NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./components/dashboard/DashboardPage";
import IDEPage from "./components/ide/IDEPage";
import AuthPage from "./components/auth/AuthPage";
import TeacherPage from "./components/assessment/TeacherPage";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const tabs = [
  { to: "/", label: "Dashboard" },
  { to: "/ide", label: "IDE" },
  { to: "/teacher", label: "Teacher" },
  { to: "/auth", label: "Auth" },
];

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <header className="topbar">
          <h1>ProctorIDE</h1>
          <nav>
            {tabs.map((tab) => (
              <NavLink key={tab.to} to={tab.to} className="tab-link">
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ide"
              element={
                <ProtectedRoute>
                  <IDEPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute roles={["ta", "instructor"]}>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
