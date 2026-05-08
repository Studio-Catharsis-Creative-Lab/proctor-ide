import React, { useState } from "react";
import "./NotebookCell.css";

export interface NotebookCellProps {
  id: string;
  type: "code" | "markdown";
  content: string;
  output?: string;
  status?: "ready" | "running" | "error" | "success";
  language?: string;
  onUpdate?: (content: string) => void;
  onRun?: () => void;
  onDelete?: () => void;
  onAddCell?: () => void;
  readonly?: boolean;
}

export function NotebookCell({
  id,
  type,
  content,
  output,
  status = "ready",
  language = "python",
  onUpdate,
  onRun,
  onDelete,
  onAddCell,
  readonly = false,
}: NotebookCellProps) {
  const [isEditing, setIsEditing] = useState(true);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate?.(e.target.value);
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "running";
      case "error":
        return "error";
      case "success":
        return "success";
      default:
        return "ready";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "running":
        return "Running...";
      case "error":
        return "Error";
      case "success":
        return "Done";
      default:
        return "Ready";
    }
  };

  if (type === "markdown") {
    return (
      <div className="notebook-cell markdown">
        <div className="cell-header">
          <div className="cell-type-badge markdown">MD</div>
          <div className="cell-number">Cell</div>
        </div>
        <div className="markdown-cell-content">
          {isEditing ? (
            <textarea
              value={content}
              onChange={handleContentChange}
              onBlur={() => setIsEditing(false)}
              disabled={readonly}
              className="cell-input-area"
              placeholder="Enter markdown text..."
            />
          ) : (
            <div onClick={() => !readonly && setIsEditing(true)}>
              {content || <div className="cell-output-empty">Empty cell. Click to edit.</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-cell">
      <div className="cell-header">
        <div className="cell-type-badge">Code</div>
        <div className="cell-number">{id}</div>
        <span style={{ marginLeft: "auto", marginRight: "auto" }}>
          {language}
        </span>
        <div className="cell-status">
          <div className={`cell-status-indicator ${getStatusColor()}`} />
          <div className="cell-status-text">{getStatusText()}</div>
        </div>
      </div>

      <div className="cell-input">
        <textarea
          value={content}
          onChange={handleContentChange}
          disabled={readonly}
          className="cell-input-area"
          placeholder={`Write your ${language} code here...`}
        />
      </div>

      {output && (
        <div className="cell-output">
          <div className="cell-output-label">Output</div>
          <div className={`cell-output-content ${status === "error" ? "cell-output-error" : ""}`}>
            {output}
          </div>
        </div>
      )}

      <div className="cell-controls">
        <button
          className="cell-btn run"
          onClick={onRun}
          title="Run Cell (Ctrl+Enter)"
          disabled={readonly || status === "running"}
        >
          ▶
        </button>
        <button
          className="cell-btn"
          onClick={onAddCell}
          title="Add Cell Below"
        >
          ➕
        </button>
        <button
          className="cell-btn delete"
          onClick={onDelete}
          title="Delete Cell"
          disabled={readonly}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
