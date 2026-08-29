import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Compass } from "lucide-react";

export default function NotFound() {
  const currentUser = useSelector((state) => state.user.currentUser.data);
  const role = currentUser?.role || "user";

  const homeUrl = role === "admin" ? "/admin" : role === "seller" ? "/seller" : "/";

  return (
    <div className="max-w-md mx-auto px-4 py-24 font-sans text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-surface-muted border border-border flex items-center justify-center text-ink-muted">
        <Compass size={24} strokeWidth={1.5} />
      </div>

      <h1 className="font-display font-semibold text-3xl text-ink">404</h1>
      <p className="text-sm text-ink-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="pt-2">
        <Link to={homeUrl}>
          <button className="bg-accent text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
            Back to home
          </button>
        </Link>
      </div>
    </div>
  );
}