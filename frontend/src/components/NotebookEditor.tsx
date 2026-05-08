import React, { useState, useCallback } from "react";
import { NotebookCell, NotebookCellProps } from "./NotebookCell";
import "./NotebookEditor.css";

export interface NotebookEditorProps {
  title?: string;
  challengeDescription?: string;
  initialCells?: NotebookCellProps[];
  onCellsChange?: (cells: NotebookCellProps[]) => void;
  onRunAll?: (cells: NotebookCellProps[]) => void;
  onRunCell?: (cellId: string) => void;
  readonly?: boolean;
}

export function NotebookEditor({
  title = "Code Notebook",
  challengeDescription,
  initialCells = [],
  onCellsChange,
  onRunAll,
  onRunCell,
  readonly = false,
}: NotebookEditorProps) {
  const [cells, setCells] = useState<NotebookCellProps[]>(
    initialCells.length > 0
      ? initialCells
      : [
          {
            id: "cell-1",
            type: "markdown",
            content: "# Challenge Instructions\n\nStart coding below!",
          },
          {
            id: "cell-2",
            type: "code",
            content: "",
            language: "python",
          },
        ]
  );

  const updateCell = useCallback(
    (cellId: string, updates: Partial<NotebookCellProps>) => {
      const updated = cells.map((cell) =>
        cell.id === cellId ? { ...cell, ...updates } : cell
      );
      setCells(updated);
      onCellsChange?.(updated);
    },
    [cells, onCellsChange]
  );

  const deleteCell = useCallback(
    (cellId: string) => {
      if (cells.length > 1) {
        const updated = cells.filter((cell) => cell.id !== cellId);
        setCells(updated);
        onCellsChange?.(updated);
      }
    },
    [cells, onCellsChange]
  );

  const addCell = useCallback(
    (afterCellId: string, type: "code" | "markdown" = "code") => {
      const index = cells.findIndex((cell) => cell.id === afterCellId);
      const newCell: NotebookCellProps = {
        id: `cell-${Date.now()}`,
        type,
        content: "",
        language: type === "code" ? "python" : undefined,
      };

      const updated = [
        ...cells.slice(0, index + 1),
        newCell,
        ...cells.slice(index + 1),
      ];
      setCells(updated);
      onCellsChange?.(updated);
    },
    [cells, onCellsChange]
  );

  const handleRunAll = useCallback(() => {
    onRunAll?.(cells);
  }, [cells, onRunAll]);

  const handleRunCell = useCallback(
    (cellId: string) => {
      onRunCell?.(cellId);
    },
    [onRunCell]
  );

  return (
    <div className="notebook-editor">
      {/* Toolbar */}
      <div className="notebook-toolbar">
        <div className="notebook-title">{title}</div>
        <button className="notebook-toolbar-btn run-all" onClick={handleRunAll}>
          ▶ Run All
        </button>
        <button className="notebook-toolbar-btn">
          ⚙️ Settings
        </button>
      </div>

      {/* Notebook Content */}
      <div className="notebook-container">
        {/* Challenge Description Section */}
        {challengeDescription && (
          <div className="challenge-section">
            <div className="challenge-description">
              {challengeDescription}
            </div>
          </div>
        )}

        {/* Cells */}
        {cells.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📓</div>
            <div className="empty-state-title">No Cells Yet</div>
            <div className="empty-state-text">Create your first code cell to get started</div>
            <button
              className="empty-state-btn"
              onClick={() => addCell("", "code")}
            >
              + Add Code Cell
            </button>
          </div>
        ) : (
          <div className="cells-container">
            {cells.map((cell, index) => (
              <NotebookCell
                key={cell.id}
                {...cell}
                readonly={readonly}
                onUpdate={(content) =>
                  updateCell(cell.id, { content })
                }
                onRun={() => handleRunCell(cell.id)}
                onDelete={() => deleteCell(cell.id)}
                onAddCell={() => addCell(cell.id, "code")}
              />
            ))}
            <div className="add-cell-button-container">
              <button
                className="add-cell-button"
                onClick={() => addCell(cells[cells.length - 1].id, "code")}
              >
                + Add Code Cell
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
