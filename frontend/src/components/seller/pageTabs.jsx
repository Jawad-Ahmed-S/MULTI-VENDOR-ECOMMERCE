import { NavLink } from "react-router-dom";

/**
 * Segmented tab control for switching between related views of the same
 * entity (e.g. Details / Performance) without leaving the "page".
 *
 * tabs: Array<{ to: string, label: string, icon?: Component, end?: boolean }>
 */
export default function PageTabs({ tabs }) {
  return (
    <div className="inline-flex items-center gap-1 border border-border rounded-md p-1 bg-surface-muted/40 font-sans">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-accent text-white"
                : "text-ink-muted hover:text-ink hover:bg-surface"
            }`
          }
        >
          {tab.icon ? <tab.icon className="w-3.5 h-3.5" /> : null}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}