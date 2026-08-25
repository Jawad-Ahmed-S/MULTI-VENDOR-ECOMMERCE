import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-ink-muted py-2">
      <Link to="/" className="hover:text-ink transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={12} className="text-border-strong" />
          {item.link ? (
            <Link to={item.link} className="hover:text-ink transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}