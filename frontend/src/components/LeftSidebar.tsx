import { useEffect, useState } from "react";
import "./LeftSidebar.css";

export interface FileNode {
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

export function LeftSidebar({ files, onFileSelect, selectedFileId }: LeftSidebarProps) {
  const list = files === undefined ? defaultFiles : files;
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set());

  function collectFilePaths(nodes: FileNode[]): string[] {
    const out: string[] = [];
    for (const n of nodes) {
      if (n.type === "file") out.push(n.id.replace(/\\/g, "/"));
      else if (n.children?.length) out.push(...collectFilePaths(n.children));
    }
    return out;
  }

  // Expand all folders that contain workspace files (small trees, e.g. course notebooks).
  useEffect(() => {
    const paths = collectFilePaths(list);
    if (paths.length === 0) return;
    const folderIds = new Set<string>();
    for (const p of paths) {
      const parts = p.split("/").filter(Boolean);
      for (let i = 0; i < parts.length - 1; i++) {
        folderIds.add(`folder:${parts.slice(0, i + 1).join("/")}`);
      }
    }
    setExpandedFolders((prev) => new Set([...prev, ...folderIds]));
  }, [list]);

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
        {list.length === 0 ? (
          <div className="sidebar-empty" style={{ padding: "12px", opacity: 0.75 }}>
            No files in workspace yet.
          </div>
        ) : (
          <ul className="file-tree">
            {list.map((file) => renderFileItem(file))}
          </ul>
        )}
      </div>
    </div>
  );
}
