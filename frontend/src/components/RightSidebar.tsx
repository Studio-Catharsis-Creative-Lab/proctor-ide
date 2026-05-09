import { useState, useRef, useEffect } from "react";
import "./RightSidebar.css";

export interface Comment {
  id: string;
  author: string;
  role: "student" | "instructor" | "ta";
  text: string;
  timestamp: Date;
}

interface RightSidebarProps {
  comments?: Comment[];
  userRole?: "student" | "instructor" | "ta";
  onSendComment?: (text: string) => void;
  readonly?: boolean;
}

export function RightSidebar({
  comments = [],
  userRole = "student",
  onSendComment,
  readonly = false,
}: RightSidebarProps) {
  const [commentText, setCommentText] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = () => {
    if (commentText.trim()) {
      onSendComment?.(commentText);
      setCommentText("");
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const getAvatarInitial = (author: string) => {
    return author.charAt(0).toUpperCase();
  };

  return (
    <div className="right-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Comments</div>
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="comments-empty">
          <div className="comments-empty-icon">💬</div>
          <div className="comments-empty-text">No comments yet</div>
        </div>
      ) : (
        <div className="comments-feed" ref={feedRef}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-item ${comment.role}`}
            >
              <div className={`comment-avatar ${comment.role}`}>
                {getAvatarInitial(comment.author)}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-role">{comment.role}</span>
                  <span className="comment-time">{formatTime(comment.timestamp)}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!readonly && userRole !== "student" && (
        <div className="comment-input-area">
          <div className="comment-input-label">Add Feedback</div>
          <textarea
            className="comment-textarea"
            placeholder="Write feedback or comments..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSend();
              }
            }}
          />
          <div className="comment-input-footer">
            <button
              className="comment-cancel-btn"
              onClick={() => setCommentText("")}
              disabled={!commentText.trim()}
            >
              Clear
            </button>
            <button
              className="comment-send-btn"
              onClick={handleSend}
              disabled={!commentText.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
