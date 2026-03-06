import { useState, useEffect } from "react";
import { fetchSettings, updateSettings } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle } from "lucide-react";

const SettingsPage = () => {
  const [upstreamUrl, setUpstreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then((s) => {
      setUpstreamUrl(s.upstream_url);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ upstream_url: upstreamUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground py-8 text-center">加载中...</p>;

  return (
    <div className="max-w-lg space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">代理设置</h2>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">上游地址 (Upstream URL)</label>
        <Input
          value={upstreamUrl}
          onChange={(e) => setUpstreamUrl(e.target.value)}
          placeholder="http://127.0.0.1:3000"
          className="bg-secondary border-border font-mono"
        />
        <p className="text-xs text-muted-foreground">
          所有非管理路径的请求将被转发到此地址
        </p>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saved ? (
          <><CheckCircle className="h-4 w-4 mr-1" /> 已保存</>
        ) : (
          <><Save className="h-4 w-4 mr-1" /> {saving ? "保存中..." : "保存"}</>
        )}
      </Button>
    </div>
  );
};

export default SettingsPage;
