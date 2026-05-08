import { useEffect, useState } from "react";
import { fetchActivities } from "../../services/api";
import { useAuth } from "../auth/AuthProvider";

type Activity = {
  id: number;
  title: string;
  type: string;
  tracking_level: string;
  status?: string;
};

export default function DashboardPage() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchActivities(token)
      .then(setActivities)
      .catch((err: Error) => setError(err.message));
  }, [token]);

  return (
    <section className="panel">
      <h2>Student Dashboard</h2>
      <p>Assignments, challenges, quizzes, and exams in one view.</p>
      {error ? <p>Failed to load activities: {error}</p> : null}
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.title} - {activity.type} - {activity.status ?? "not started"} - tracking: {activity.tracking_level}
          </li>
        ))}
      </ul>
    </section>
  );
}
