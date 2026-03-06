const API_BASE = import.meta.env.DEV ? "http://localhost:7891" : "";

let adminPassword = sessionStorage.getItem("admin_password") || "";

export function setAdminPassword(pw: string) {
  adminPassword = pw;
  sessionStorage.setItem("admin_password", pw);
}

export function getAdminPassword() {
  return adminPassword;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("x-admin-password", adminPassword);
  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (resp.status === 401) throw new Error("Unauthorized");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function login(password: string) {
  const resp = await fetch(`${API_BASE}/admin/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!resp.ok) throw new Error("Wrong password");
  setAdminPassword(password);
  return true;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  model: string;
  messages: string;
  assistant_reply: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  duration_ms: number;
  client_ip: string;
  api_key_hint: string;
  path: string;
  method: string;
}

export async function fetchLogs(params: {
  model?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params.model) qs.set("model", params.model);
  if (params.start_time) qs.set("start_time", params.start_time);
  if (params.end_time) qs.set("end_time", params.end_time);
  if (params.page) qs.set("page", String(params.page));
  return apiFetch(`/admin/api/logs?${qs.toString()}`) as Promise<{
    logs: LogEntry[];
    total: number;
    page: number;
    page_size: number;
  }>;
}

export async function fetchSettings() {
  return apiFetch("/admin/api/settings") as Promise<{ upstream_url: string }>;
}

export async function updateSettings(data: { upstream_url: string }) {
  return apiFetch("/admin/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
