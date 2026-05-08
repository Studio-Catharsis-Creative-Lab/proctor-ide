import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
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

export default function IDEPage() {
  const { token, user } = useAuth();
  const [content, setContent] = useState("Loading workspace...");
  const [timeline, setTimeline] = useState<Array<{ id: string; summary: string; timestamp: string }>>([]);
  const [filePath, setFilePath] = useState("main.py");
  const [stdin, setStdin] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("Ready.");
  const [isRunning, setIsRunning] = useState(false);
  const [comments, setComments] = useState<Array<{ user_id: string; line_number: number; text: string; timestamp: string }>>([]);
  const [commentText, setCommentText] = useState("");
  const [trackingLevel] = useState<"minimal" | "basic" | "moderate" | "comprehensive">("moderate");

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
      setFilePath(firstPath);
      setContent(payload.files[firstPath] ?? "");
    });
    fetchWorkspaceTimeline(WORKSPACE_ID, token).then((payload) => setTimeline(payload.timeline));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/comments/${ACTIVITY_ID}?token=${encodeURIComponent(token)}`);
    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          user_id: string;
          line_number: number;
          text: string;
          timestamp: string;
        };
        setComments((prev) => [parsed, ...prev].slice(0, 30));
      } catch {
        // Ignore malformed payloads from dev server.
      }
    };
    return () => ws.close();
  }, [token]);

  async function saveNow() {
    if (!token) return;
    await saveWorkspaceFile(WORKSPACE_ID, filePath, content, token);
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
      setConsoleOutput("HTML preview updated.");
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
      setConsoleOutput(
        [
          result.status ? `status: ${result.status.description}` : null,
          result.stdout ? `stdout:\n${result.stdout}` : null,
          result.stderr ? `stderr:\n${result.stderr}` : null,
          result.compile_output ? `compile_output:\n${result.compile_output}` : null,
          result.message ? `message:\n${result.message}` : null,
        ]
          .filter(Boolean)
          .join("\n\n") || "No output.",
      );
    } catch (err) {
      setConsoleOutput(`Run failed: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  }

  async function sendComment() {
    if (!token || !commentText.trim()) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/comments/${ACTIVITY_ID}?token=${encodeURIComponent(token)}`);
    const payload = {
      line_number: 1,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    ws.onopen = () => {
      ws.send(JSON.stringify(payload));
      ws.close();
      setCommentText("");
    };
  }

  return (
    <section className="two-col">
      <div className="panel">
        <h2>Editor</h2>
        <button onClick={saveNow} disabled={saveDisabled}>
          Save + Commit
        </button>
        <button onClick={runNow} disabled={saveDisabled || isRunning}>
          {isRunning ? "Running..." : "Run"}
        </button>
        <Editor
          height="60vh"
          defaultLanguage="python"
          value={content}
          onChange={(value) => setContent(value ?? "")}
          theme="vs-dark"
        />
      </div>
      <div className="panel">
        <h2>Timeline</h2>
        <ul>
          {timeline.map((item) => (
            <li key={item.id}>
              {item.id} - {item.summary}
            </li>
          ))}
        </ul>
        <h3>Console</h3>
        <label>
          stdin
          <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} style={{ width: "100%" }} />
        </label>
        <pre>{consoleOutput}</pre>
        {filePath.toLowerCase().endsWith(".html") ? (
          <>
            <h3>UI Preview</h3>
            <iframe title="preview" srcDoc={content} style={{ width: "100%", height: 260, border: "1px solid #1f2937" }} />
          </>
        ) : null}
        <h3>Comments</h3>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          placeholder="Leave a line-level comment..."
          style={{ width: "100%" }}
        />
        <button onClick={sendComment}>Send Comment</button>
        <ul>
          {comments.map((comment, index) => (
            <li key={`${comment.timestamp}-${index}`}>
              [{comment.line_number}] {comment.user_id}: {comment.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
