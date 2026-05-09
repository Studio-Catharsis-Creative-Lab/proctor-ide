import { useEffect, useMemo, useState } from "react";
import {
  executeCode,
  fetchWorkspace,
  fetchWorkspaceTimeline,
  saveWorkspaceFile,
} from "../../services/api";
import { useAuth } from "../auth/AuthProvider";
import { useTracking } from "./useTracking";
import { DockLayout } from "../../features/layout/DockLayout";
import { MenuBar } from "../MenuBar";
import { LeftSidebar, type FileNode } from "../LeftSidebar";
import { buildFileTree } from "./workspaceFileTree";
import { NotebookEditor } from "../NotebookEditor";
import { RightSidebar, type Comment } from "../RightSidebar";
import { StatusBar } from "../StatusBar";

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
  if (lower.endsWith(".ipynb")) return "json";
  return "plaintext";
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

export default function IDEPage() {
  const { token, user } = useAuth();
  const [workspaceFiles, setWorkspaceFiles] = useState<Record<string, string>>({});
  const [content, setContent] = useState("Loading workspace...");
  const [, setTimeline] = useState<Array<{ id: string; summary: string; timestamp: string }>>([]);
  const [filePath, setFilePath] = useState("main.py");
  const [stdin] = useState("");
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
  const [trackingLevel] = useState<"minimal" | "basic" | "moderate" | "comprehensive">("moderate");

  const fileTree = useMemo(() => buildFileTree(Object.keys(workspaceFiles)), [workspaceFiles]);

  const { pushTrackingEvent } = useTracking({
    token,
    studentId: user?.uid ?? "unknown",
    activityId: ACTIVITY_ID,
    trackingLevel,
    currentFilePath: filePath,
    currentContent: content,
  });

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchWorkspace(WORKSPACE_ID, token)
      .then((payload) => {
        setWorkspaceFiles(payload.files);
        const keys = Object.keys(payload.files);
        const firstPath = keys.includes("main.py") ? "main.py" : keys.sort()[0] ?? "main.py";
        setFilePath(firstPath);
        setContent(payload.files[firstPath] ?? "");
      })
      .catch((err: Error) => {
        setContent(`# Workspace load failed\n\n${err.message}`);
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

  async function runNow() {
    if (!token) return;
    if (filePath.toLowerCase().endsWith(".ipynb")) {
      setTerminalState({
        status: "Notebook",
        stdout: "Run is for code files. Edit this .ipynb as JSON or switch to a .py file to execute on Judge0.",
        stderr: "",
        compileOutput: "",
        message: "",
      });
      return;
    }
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveNow();
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

  function handleFileSelect(file: FileNode) {
    if (file.type !== "file") return;
    const path = file.id.replace(/\\/g, "/");
    setFilePath(path);
    setContent(workspaceFiles[path] ?? "");
  }

  const commentList: Comment[] = assistantMessages.map((msg) => ({
    id: msg.timestamp,
    author: msg.user_id,
    role: "instructor" as const,
    text: msg.text,
    timestamp: new Date(msg.timestamp),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MenuBar onSave={saveNow} onNew={() => {}} onOpen={() => {}} />
      <DockLayout
        left={<LeftSidebar files={fileTree} onFileSelect={handleFileSelect} selectedFileId={filePath} />}
        center={
          <NotebookEditor
            key={filePath}
            title="Proctor IDE"
            challengeDescription="Write Python code in the cell below and click Run to execute."
            initialCells={[
              {
                id: "code-1",
                type: "code",
                content,
                language: inferEditorLanguage(filePath),
                status: isRunning ? "running" : terminalState.stderr ? "error" : "success",
                output: terminalState.stdout || terminalState.stderr || "",
                onUpdate: setContent,
                onRun: runNow,
              },
            ]}
          />
        }
        right={
          <RightSidebar
            comments={commentList}
            userRole="student"
            onSendComment={sendComment}
            readonly={!token}
          />
        }
      />
      <StatusBar
        status={isRunning ? "running" : terminalState.stderr ? "error" : "ready"}
        message={terminalState.status}
        fileName={filePath}
        language={inferEditorLanguage(filePath)}
        lineCount={content.split("\n").length}
      />
    </div>
  );
}
