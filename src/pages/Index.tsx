import { useState } from "react";
import { getAdminPassword } from "@/lib/api";
import LoginPage from "@/pages/LoginPage";
import LogsPage from "@/pages/LogsPage";
import SettingsPage from "@/pages/SettingsPage";
import { Activity, Settings, LogOut } from "lucide-react";

const Index = () => {
  const [authed, setAuthed] = useState(!!getAdminPassword());
  const [tab, setTab] = useState<"logs" | "settings">("logs");

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">AI Proxy Monitor</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab("logs")}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tab === "logs"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              日志
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4 inline mr-1" />
              设置
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_password");
                setAuthed(false);
              }}
              className="ml-4 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl p-4">
        {tab === "logs" ? <LogsPage /> : <SettingsPage />}
      </main>
    </div>
  );
};

export default Index;
