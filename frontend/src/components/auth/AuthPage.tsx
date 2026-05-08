import { useAuth } from "./AuthProvider";

export default function AuthPage() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <section className="panel">
      <h2>Authentication</h2>
      <p>Google Sign-in for ProctorIDE (Firebase Authentication).</p>
      {user ? (
        <>
          <p>Signed in as {user.email}</p>
          <button onClick={logout}>Sign out</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </section>
  );
}
