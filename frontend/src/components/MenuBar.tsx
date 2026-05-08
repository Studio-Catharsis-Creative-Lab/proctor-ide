import React from "react";
import "./MenuBar.css";

interface MenuBarProps {
  onSave?: () => void;
  onNew?: () => void;
  onOpen?: () => void;
}

export function MenuBar({ onSave, onNew, onOpen }: MenuBarProps) {
  return (
    <div className="menu-bar">
      <div className="menu-left">
        {/* File Menu */}
        <div className="menu-item">
          <button className="menu-item-button">File</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item" onClick={onNew}>
              New
              <span className="menu-shortcut">Ctrl+N</span>
            </button>
            <button className="menu-dropdown-item" onClick={onOpen}>
              Open
              <span className="menu-shortcut">Ctrl+O</span>
            </button>
            <button className="menu-dropdown-item" onClick={onSave}>
              Save
              <span className="menu-shortcut">Ctrl+S</span>
            </button>
            <div className="menu-dropdown-divider" />
            <button className="menu-dropdown-item">
              Close
              <span className="menu-shortcut">Ctrl+W</span>
            </button>
          </div>
        </div>

        {/* Edit Menu */}
        <div className="menu-item">
          <button className="menu-item-button">Edit</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">
              Undo
              <span className="menu-shortcut">Ctrl+Z</span>
            </button>
            <button className="menu-dropdown-item">
              Redo
              <span className="menu-shortcut">Ctrl+Y</span>
            </button>
            <div className="menu-dropdown-divider" />
            <button className="menu-dropdown-item">
              Cut
              <span className="menu-shortcut">Ctrl+X</span>
            </button>
            <button className="menu-dropdown-item">
              Copy
              <span className="menu-shortcut">Ctrl+C</span>
            </button>
            <button className="menu-dropdown-item">
              Paste
              <span className="menu-shortcut">Ctrl+V</span>
            </button>
          </div>
        </div>

        {/* View Menu */}
        <div className="menu-item">
          <button className="menu-item-button">View</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">
              Toggle Full Screen
              <span className="menu-shortcut">F11</span>
            </button>
            <button className="menu-dropdown-item">
              Zoom In
              <span className="menu-shortcut">Ctrl++</span>
            </button>
            <button className="menu-dropdown-item">
              Zoom Out
              <span className="menu-shortcut">Ctrl+-</span>
            </button>
            <button className="menu-dropdown-item">
              Reset Zoom
              <span className="menu-shortcut">Ctrl+0</span>
            </button>
          </div>
        </div>

        {/* Panels Menu */}
        <div className="menu-item">
          <button className="menu-item-button">Panels</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">
              Show Explorer
              <span className="menu-shortcut">Ctrl+B</span>
            </button>
            <button className="menu-dropdown-item">
              Show Comments
              <span className="menu-shortcut">Ctrl+J</span>
            </button>
            <button className="menu-dropdown-item">
              Show Output
              <span className="menu-shortcut">Ctrl+\`</span>
            </button>
          </div>
        </div>
      </div>

      <div className="menu-right">
        {/* Assistant Menu */}
        <div className="menu-item">
          <button className="menu-item-button">Assistant</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">Ask Assistant</button>
            <button className="menu-dropdown-item">Get Hint</button>
            <button className="menu-dropdown-item">View Solution</button>
          </div>
        </div>

        {/* Agent Menu */}
        <div className="menu-item">
          <button className="menu-item-button">Agent</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">Run Agent</button>
            <button className="menu-dropdown-item">Agent Settings</button>
          </div>
        </div>

        {/* Help Menu */}
        <div className="menu-item">
          <button className="menu-item-button">Help</button>
          <div className="menu-dropdown">
            <button className="menu-dropdown-item">Documentation</button>
            <button className="menu-dropdown-item">Keyboard Shortcuts</button>
            <div className="menu-dropdown-divider" />
            <button className="menu-dropdown-item">About</button>
          </div>
        </div>
      </div>
    </div>
  );
}
