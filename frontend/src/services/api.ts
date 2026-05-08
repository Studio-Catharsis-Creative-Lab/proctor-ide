import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  timeout: 15000,
});

export type RunRequest = {
  language_id: number;
  source_code: string;
  stdin?: string;
};

export async function runCode(payload: RunRequest) {
  const { data } = await api.post("/run", payload);
  return data;
}

export async function fetchActivities(token: string) {
  const { data } = await api.get("/activities", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as Array<{
    id: number;
    title: string;
    type: string;
    tracking_level: string;
    status?: string;
    due_date?: string | null;
  }>;
}

export async function fetchWorkspace(workspaceId: string, token: string) {
  const { data } = await api.get(`/workspace/${workspaceId}/files`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as { workspace_id: string; files: Record<string, string> };
}

export async function saveWorkspaceFile(
  workspaceId: string,
  path: string,
  content: string,
  token: string,
) {
  const { data } = await api.put(
    `/workspace/${workspaceId}/files/${encodeURIComponent(path)}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data;
}

export async function fetchWorkspaceTimeline(workspaceId: string, token: string) {
  const { data } = await api.get(`/workspace/${workspaceId}/log`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as { workspace_id: string; timeline: Array<{ id: string; summary: string; timestamp: string }> };
}

export async function executeCode(
  token: string,
  payload: { language_id: number; source_code: string; stdin?: string; activity_id?: string },
) {
  const { data } = await api.post("/run", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    status?: { id: number; description: string };
    time?: string | null;
    memory?: number | null;
  };
}

export async function postTrackingEvents(
  token: string,
  payload: Array<{
    student_id: string;
    activity_id: string;
    event_type: string;
    event_data: Record<string, unknown>;
  }>,
) {
  const { data } = await api.post("/tracking/events", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as { accepted: number };
}
