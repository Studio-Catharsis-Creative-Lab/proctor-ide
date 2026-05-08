import { useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../auth/AuthProvider";

export default function TeacherPage() {
  const { token } = useAuth();
  const [activityId, setActivityId] = useState("1");
  const [assignmentMd, setAssignmentMd] = useState("# Assignment\n\nImplement the required function.");
  const [studentUids, setStudentUids] = useState("student-1,student-2");
  const [status, setStatus] = useState("Ready.");

  async function uploadTemplate() {
    if (!token) return;
    const form = new FormData();
    form.append("assignment_md", assignmentMd);
    await api.post(`/activities/${activityId}/template`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatus("Template uploaded.");
  }

  async function enroll() {
    if (!token) return;
    const payload = {
      student_uids: studentUids
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const { data } = await api.post(`/activities/${activityId}/enroll`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatus(`Enrolled ${data.enrolled_count} students.`);
  }

  return (
    <section className="panel">
      <h2>Teacher Assignment Management</h2>
      <p>Create activities, upload starter files, and enroll students.</p>
      <label>
        Activity ID
        <input value={activityId} onChange={(e) => setActivityId(e.target.value)} />
      </label>
      <label>
        ASSIGNMENT.md
        <textarea value={assignmentMd} onChange={(e) => setAssignmentMd(e.target.value)} rows={5} style={{ width: "100%" }} />
      </label>
      <button onClick={uploadTemplate}>Upload Template</button>
      <label>
        Student UIDs (comma-separated)
        <input value={studentUids} onChange={(e) => setStudentUids(e.target.value)} />
      </label>
      <button onClick={enroll}>Enroll Students</button>
      <p>{status}</p>
    </section>
  );
}
