import React from "react";
import "./StatusBar.css";

interface StatusBarProps {
  status?: "ready" | "running" | "error" | "success";
  message?: string;
  fileName?: string;
  language?: string;
  lineCount?: number;
  charCount?: number;
  encoding?: string;
  onStatusClick?: () => void;
}

export function StatusBar({
  status = "ready",
  message,
  fileName,
  language,
  lineCount = 0,
  charCount = 0,
  encoding = "UTF-8",
  onStatusClick,
}: StatusBarProps) {
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "running";
      case "error":
        return "error";
      case "success":
        return "success";
      default:
        return "";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "running":
        return "Running...";
      case "error":
        return "Error";
      case "success":
        return "Success";
      default:
        return "Ready";
    }
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div
          className="status-indicator"
          onClick={onStatusClick}
          title={message || getStatusText()}
        >
          <div className={`status-dot ${getStatusColor()}`} />
          <span>{getStatusText()}</span>
        </div>

        {message && (
          <>
            <div className="status-divider" />
            <div className="status-item" title={message}>
              {message}
            </div>
          </>
        )}
      </div>

      <div className="status-center">
        {fileName && (
          <span>
            {fileName}
            {language && ` • ${language}`}
          </span>
        )}
      </div>

      <div className="status-right">
        {encoding && (
          <div className="status-item" title="File Encoding">
            {encoding}
          </div>
        )}

        {lineCount > 0 && (
          <>
            <div className="status-divider" />
            <div className="status-info" title="Lines">
              <span className="status-label">Ln</span>
              <span className="status-value">{lineCount}</span>
            </div>
          </>
        )}

        {charCount > 0 && (
          <>
            <div className="status-divider" />
            <div className="status-info" title="Characters">
              <span className="status-label">Ch</span>
              <span className="status-value">{charCount}</span>
            </div>
          </>
        )}

        {language && (
          <>
            <div className="status-divider" />
            <div className="status-item" title="Language Mode">
              {language}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
