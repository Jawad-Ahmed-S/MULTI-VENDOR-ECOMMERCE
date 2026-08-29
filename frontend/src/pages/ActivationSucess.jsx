import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ActivationSuccess() {
  const navigate = useNavigate();

  // Read the token once, synchronously, during initial render.
  // This is pure/deterministic for a given URL, so it belongs in
  // the initializer, not in an effect.
  const [token] = useState(() => {
    const hash = window.location.hash;
    return new URLSearchParams(hash.slice(1)).get("token");
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      navigate("/login", { replace: true });
    }
    // If there's no token, we just render the error UI below —
    // no state update needed for that case.
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Something went wrong activating your account.</p>
          <button
            onClick={() => navigate("/login")}
            className="text-accent hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-ink-muted">Activating your account...</p>
    </div>
  );
}