import { useEffect, useRef } from "react";
import { postTrackingEvents } from "../../services/api";

type TrackingEvent = {
  student_id: string;
  activity_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
};

export function useTracking(params: {
  token: string | null;
  studentId: string;
  activityId: string;
  trackingLevel: "minimal" | "basic" | "moderate" | "comprehensive";
  currentFilePath: string;
  currentContent: string;
}) {
  const queueRef = useRef<TrackingEvent[]>([]);

  function push(event: Omit<TrackingEvent, "student_id" | "activity_id">) {
    queueRef.current.push({
      student_id: params.studentId,
      activity_id: params.activityId,
      event_type: event.event_type,
      event_data: event.event_data,
    });
  }

  useEffect(() => {
    if (!params.token) return;
    const id = setInterval(async () => {
      const batch = queueRef.current.splice(0, queueRef.current.length);
      if (!batch.length) return;
      try {
        await postTrackingEvents(params.token!, batch);
      } catch {
        queueRef.current.unshift(...batch);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [params.token]);

  useEffect(() => {
    if (params.trackingLevel === "minimal") return;
    push({
      event_type: "keystroke_batch",
      event_data: {
        path: params.currentFilePath,
        char_count: params.currentContent.length,
      },
    });
  }, [params.currentContent, params.currentFilePath, params.trackingLevel]);

  useEffect(() => {
    function onPaste() {
      push({ event_type: "paste", event_data: { path: params.currentFilePath } });
    }
    function onCut() {
      push({ event_type: "cut", event_data: { path: params.currentFilePath } });
    }
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    return () => {
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
    };
  }, [params.currentFilePath]);

  useEffect(() => {
    function onFocus() {
      push({ event_type: "window_focus_gained", event_data: {} });
    }
    function onBlur() {
      push({ event_type: "window_focus_lost", event_data: {} });
    }
    function onVisibility() {
      if (document.hidden) {
        push({ event_type: "tab_switch", event_data: { hidden: true } });
      }
    }
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { pushTrackingEvent: push };
}
