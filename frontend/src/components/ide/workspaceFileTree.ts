import type { FileNode } from "../LeftSidebar";

/** Turn flat workspace paths into a nested explorer tree. */
export function buildFileTree(paths: string[]): FileNode[] {
  interface Branch {
    dirs: Map<string, Branch>;
    files: Map<string, string>;
  }
  const root: Branch = { dirs: new Map(), files: new Map() };

  for (const raw of [...paths].sort((a, b) => a.localeCompare(b))) {
    const p = raw.replace(/\\/g, "/").replace(/^\//, "");
    if (!p) continue;
    const segs = p.split("/").filter(Boolean);
    let b = root;
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const isLast = i === segs.length - 1;
      if (isLast) {
        b.files.set(seg, p);
      } else {
        if (!b.dirs.has(seg)) b.dirs.set(seg, { dirs: new Map(), files: new Map() });
        b = b.dirs.get(seg)!;
      }
    }
  }

  function branchToNodes(b: Branch, prefix: string): FileNode[] {
    const nodes: FileNode[] = [];
    const dirEntries = [...b.dirs.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [name, sub] of dirEntries) {
      const pathPrefix = prefix ? `${prefix}/${name}` : name;
      nodes.push({
        id: `folder:${pathPrefix}`,
        name,
        type: "folder",
        children: branchToNodes(sub, pathPrefix),
      });
    }
    const fileEntries = [...b.files.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [name, fullPath] of fileEntries) {
      nodes.push({ id: fullPath, name, type: "file" });
    }
    return nodes;
  }

  return branchToNodes(root, "");
}
