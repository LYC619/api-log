import { useState, useEffect } from "react";
import { fetchLogs, LogEntry } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Clock, Cpu, MessageSquare } from "lucide-react";

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [model, setModel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs({ model, start_time: startTime, end_time: endTime, page });
      setLogs(data.logs);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  const parseMessages = (messagesJson: string) => {
    try {
      return JSON.parse(messagesJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="模型名称"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-48 bg-secondary border-border"
          />
        </div>
        <Input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-52 bg-secondary border-border"
        />
        <Input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-52 bg-secondary border-border"
        />
        <Button onClick={() => { setPage(1); loadLogs(); }}>筛选</Button>
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {loading && <p className="text-muted-foreground text-center py-8">加载中...</p>}
        {!loading && logs.length === 0 && (
          <p className="text-muted-foreground text-center py-8">暂无记录</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary truncate">
                    <Cpu className="h-3.5 w-3.5 flex-shrink-0" />
                    {log.model || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {log.assistant_reply?.slice(0, 60) || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                  {log.total_tokens && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {log.total_tokens}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {log.duration_ms}ms
                  </span>
                  <span className="font-mono">{log.api_key_hint?.slice(-8)}</span>
                  <span>{log.client_ip}</span>
                </div>
              </div>
            </button>

            {expandedId === log.id && (
              <div className="border-t border-border px-4 py-4 space-y-3">
                {/* Messages as chat bubbles */}
                {log.messages && parseMessages(log.messages).map((msg: { role: string; content: string }, i: number) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === "system"
                          ? "bg-system-bubble text-foreground"
                          : msg.role === "user"
                          ? "bg-user-bubble text-foreground"
                          : "bg-assistant-bubble text-foreground"
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-semibold">
                        {msg.role}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {/* Assistant reply */}
                {log.assistant_reply && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-xl px-4 py-2.5 text-sm bg-assistant-bubble text-foreground whitespace-pre-wrap">
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-semibold">
                        assistant (response)
                      </div>
                      {log.assistant_reply}
                    </div>
                  </div>
                )}
                {/* Meta info */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Path: {log.path}</span>
                  <span>Method: {log.method}</span>
                  {log.prompt_tokens && <span>Prompt: {log.prompt_tokens}</span>}
                  {log.completion_tokens && <span>Completion: {log.completion_tokens}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} （共 {total} 条）
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
