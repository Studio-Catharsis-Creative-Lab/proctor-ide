import React, { useState } from "react";
import "./LeftSidebar.css";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface LeftSidebarProps {
  files?: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedFileId?: string;
}

const defaultFiles: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      { id: "src-main", name: "main.py", type: "file" },
      { id: "src-utils", name: "utils.py", type: "file" },
    ],
  },
  { id: "readme", name: "README.md", type: "file" },
  { id: "requirements", name: "requirements.txt", type: "file" },
];

export function LeftSidebar({
  files = defaultFiles,
  onFileSelect,
  selectedFileId,
}: LeftSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src"])
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileItem = (item: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);

    return (
      <li key={item.id}>
        <div
          className={`file-tree-item ${item.type === "folder" && isExpanded ? "expanded" : ""} ${
            selectedFileId === item.id ? "selected" : ""
          } ${item.type === "folder" ? "file-tree-folder" : ""}`}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.id);
            } else {
              onFileSelect?.(item);
            }
          }}
        >
          {item.type === "folder" && (
            <div className="file-tree-toggle">
              {isExpanded ? "▼" : "▶"}
            </div>
          )}
          {!item.type || item.type === "file" ? <div className="file-tree-toggle" /> : null}
          <div className="file-tree-icon">
            {item.type === "folder" ? "📁" : "📄"}
          </div>
          <div className="file-tree-label">{item.name}</div>
        </div>

        {item.type === "folder" && isExpanded && item.children && (
          <ul className="file-tree-children">
            {item.children.map((child) => renderFileItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Explorer</div>
        <div className="sidebar-actions">
          <button className="sidebar-action-btn" title="New File">
            ➕
          </button>
          <button className="sidebar-action-btn" title="Refresh">
            🔄
          </button>
        </div>
      </div>
      <div className="sidebar-content">
        <ul className="file-tree">
          {files.map((file) => renderFileItem(file))}
        </ul>
      </div>
    </div>
  );
}
