import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  executeCode,
  fetchWorkspace,
  fetchWorkspaceTimeline,
  saveWorkspaceFile,
} from "../../services/api";
import { useAuth } from "../auth/AuthProvider";
import { useTracking } from "./useTracking";

const WORKSPACE_ID = "demo-workspace";
const ACTIVITY_ID = "1";

function inferEditorLanguage(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".java")) return "java";
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".cxx")) return "cpp";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".json")) return "json";
  return "plaintext";
}

export default function IDEPage() {
  const { token, user } = useAuth();
  const [workspaceFiles, setWorkspaceFiles] = useState<Record<string, string>>({});
  const [content, setContent] = useState("Loading workspace...");
  const [timeline, setTimeline] = useState<Array<{ id: string; summary: string; timestamp: string }>>([]);
  const [filePath, setFilePath] = useState("main.py");
  const [stdin, setStdin] = useState("");
  const [terminalState, setTerminalState] = useState({
    status: "Ready",
    stdout: "",
    stderr: "",
    compileOutput: "",
    message: "",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{ user_id: string; line_number: number; text: string; timestamp: string }>
  >([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [bottomTab, setBottomTab] = useState<"terminal" | "timeline" | "assistant">("terminal");
  const [trackingLevel] = useState<"minimal" | "basic" | "moderate" | "comprehensive">("moderate");
  const editorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof Editor>["onMount"]>>[0] | null>(null);

  const { pushTrackingEvent } = useTracking({
    token,
    studentId: user?.uid ?? "unknown",
    activityId: ACTIVITY_ID,
    trackingLevel,
    currentFilePath: filePath,
    currentContent: content,
  });

  const saveDisabled = useMemo(() => !token, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchWorkspace(WORKSPACE_ID, token).then((payload) => {
      const firstPath = Object.keys(payload.files)[0] ?? "main.py";
      setWorkspaceFiles(payload.files);
      setFilePath(firstPath);
      setContent(payload.files[firstPath] ?? "");
    });
    fetchWorkspaceTimeline(WORKSPACE_ID, token).then((payload) => setTimeline(payload.timeline));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    const ws = new WebSocket(`${wsBase}/ws/comments/${ACTIVITY_ID}?token=${encodeURIComponent(token)}`);
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          user_id: string;
          line_number: number;
          text: string;
          timestamp: string;
        };
        setAssistantMessages((prev) => [parsed, ...prev].slice(0, 30));
      } catch {
        // Ignore malformed payloads from dev server.
      }
    };
    return () => ws.close();
  }, [token]);

  async function saveNow() {
    if (!token) return;
    await saveWorkspaceFile(WORKSPACE_ID, filePath, content, token);
    setWorkspaceFiles((prev) => ({ ...prev, [filePath]: content }));
    pushTrackingEvent({ event_type: "save", event_data: { path: filePath } });
    const payload = await fetchWorkspaceTimeline(WORKSPACE_ID, token);
    setTimeline(payload.timeline);
  }

  function inferLanguageId(path: string) {
    const lower = path.toLowerCase();
    if (lower.endsWith(".py")) return 71;
    if (lower.endsWith(".js")) return 63;
    if (lower.endsWith(".ts")) return 74;
    if (lower.endsWith(".java")) return 62;
    if (lower.endsWith(".cpp")) return 54;
    return 71;
  }

  async function runNow() {
    if (!token) return;
    // HTML/CSS/JS files are rendered in preview pane; no Judge0 run call needed.
    if (filePath.toLowerCase().endsWith(".html")) {
      setTerminalState({
        status: "Preview",
        stdout: "HTML preview updated.",
        stderr: "",
        compileOutput: "",
        message: "",
      });
      return;
    }
    setIsRunning(true);
    try {
      const result = await executeCode(token, {
        language_id: inferLanguageId(filePath),
        source_code: content,
        stdin,
        activity_id: ACTIVITY_ID,
      });
      pushTrackingEvent({
        event_type: "run",
        event_data: { path: filePath, language: inferLanguageId(filePath) },
      });
      setTerminalState({
        status: result.status?.description ?? "Completed",
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        compileOutput: result.compile_output ?? "",
        message: result.message ?? "",
      });
    } catch (err) {
      setTerminalState({
        status: "Failed",
        stdout: "",
        stderr: `Run failed: ${(err as Error).message}`,
        compileOutput: "",
        message: "",
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function formatNow() {
    const editor = editorRef.current;
    if (!editor) return;
    await editor.getAction("editor.action.formatDocument")?.run();
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
      }
      if ((event.shiftKey && event.altKey && event.key.toLowerCase() === "f") || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f" && event.shiftKey)) {
        event.preventDefault();
        void formatNow();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  async function sendComment() {
    if (!token || !assistantInput.trim()) return;
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    const ws = new WebSocket(`${wsBase}/ws/comments/${ACTIVITY_ID}?token=${encodeURIComponent(token)}`);
    const payload = {
      line_number: 1,
      text: assistantInput.trim(),
      timestamp: new Date().toISOString(),
    };
    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();
      setAssistantInput("");
    };
  }

  return (
    <section className="vscode-shell">
      <aside className="vscode-activitybar">
        <button className="vscode-icon-btn active" title="Explorer">
          E
        </button>
        <button className="vscode-icon-btn" title="Search">
          S
        </button>
        <button className="vscode-icon-btn" title="Source Control">
          G
        </button>
      </aside>

      <aside className="vscode-sidebar">
        <div className="vscode-sidebar-title">EXPLORER</div>
        <div className="vscode-folder-label">WORKSPACE</div>
        <ul className="vscode-file-list">
          {Object.keys(workspaceFiles).map((path) => (
            <li key={path}>
              <button
                className={`vscode-file-btn ${path === filePath ? "active" : ""}`}
                onClick={() => {
                  setFilePath(path);
                  setContent(workspaceFiles[path] ?? "");
                }}
              >
                {path}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="vscode-main">
        <div className="vscode-editor-toolbar">
          <div className="vscode-tab active">{filePath}</div>
          <div className="vscode-toolbar-actions">
            <button onClick={saveNow} disabled={saveDisabled}>
              Save
            </button>
            <button onClick={formatNow} disabled={saveDisabled}>
              Format
            </button>
            <button onClick={runNow} disabled={saveDisabled || isRunning}>
              {isRunning ? "Running..." : "Run"}
            </button>
          </div>
        </div>
        <div className="vscode-editor-pane">
          <Editor
            height="100%"
            defaultLanguage={inferEditorLanguage(filePath)}
            language={inferEditorLanguage(filePath)}
            value={content}
            onChange={(value) => setContent(value ?? "")}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
        <div className="vscode-bottom-tabs">
          <button className={bottomTab === "terminal" ? "active" : ""} onClick={() => setBottomTab("terminal")}>
            TERMINAL
          </button>
          <button className={bottomTab === "timeline" ? "active" : ""} onClick={() => setBottomTab("timeline")}>
            TIMELINE
          </button>
          <button className={bottomTab === "assistant" ? "active" : ""} onClick={() => setBottomTab("assistant")}>
            ASSISTANT
          </button>
        </div>
        <div className="vscode-bottom-pane">
          {bottomTab === "terminal" ? (
            <>
              <div className="terminal-shell">
                <div className="terminal-header">
                  <span>$ proctor-run</span>
                  <span className="terminal-status">{terminalState.status}</span>
                </div>
                <label className="terminal-stdin">
                  <span>$ stdin:</span>
                  <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={2} />
                </label>
                <div className="terminal-output">
                  {terminalState.stdout ? (
                    <div className="terminal-block">
                      <div className="terminal-label">stdout</div>
                      <pre>{terminalState.stdout}</pre>
                    </div>
                  ) : null}
                  {terminalState.stderr ? (
                    <div className="terminal-block terminal-block-error">
                      <div className="terminal-label">stderr</div>
                      <pre>{terminalState.stderr}</pre>
                    </div>
                  ) : null}
                  {terminalState.compileOutput ? (
                    <div className="terminal-block terminal-block-warn">
                      <div className="terminal-label">compile output</div>
                      <pre>{terminalState.compileOutput}</pre>
                    </div>
                  ) : null}
                  {terminalState.message ? (
                    <div className="terminal-block">
                      <div className="terminal-label">message</div>
                      <pre>{terminalState.message}</pre>
                    </div>
                  ) : null}
                  {!terminalState.stdout && !terminalState.stderr && !terminalState.compileOutput && !terminalState.message ? (
                    <div className="terminal-empty">No terminal output yet. Run code to populate console.</div>
                  ) : null}
                </div>
              </div>
              {filePath.toLowerCase().endsWith(".html") ? (
                <iframe title="preview" srcDoc={content} style={{ width: "100%", height: 240, border: "1px solid #1f2937" }} />
              ) : null}
            </>
          ) : null}
          {bottomTab === "timeline" ? (
            <ul>
              {timeline.map((item) => (
                <li key={item.id}>
                  {item.id} - {item.summary}
                </li>
              ))}
            </ul>
          ) : null}
          {bottomTab === "assistant" ? (
            <>
              <p>Assistant shares the same realtime channel as comments for the current work context.</p>
              <textarea
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                rows={3}
                placeholder="Ask assistant or leave context notes..."
              />
              <button onClick={sendComment}>Send to Assistant</button>
              <ul>
                {assistantMessages.map((comment, index) => (
                  <li key={`${comment.timestamp}-${index}`}>
                    [{comment.line_number}] {comment.user_id}: {comment.text}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <footer className="vscode-statusbar">
        <span>ProctorIDE</span>
        <span>{user?.email ?? "dev user"}</span>
      </footer>
    </section>
  );
}
