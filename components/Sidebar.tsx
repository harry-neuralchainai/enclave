"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; icon: string; label: string; external?: boolean };
type NavSection = { heading: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    heading: "Workspace",
    items: [
      { href: "/", icon: "⌂", label: "Home" },
      { href: "/assistant", icon: "✦", label: "Assistant" },
      { href: "/agents", icon: "⟳", label: "Agents" },
    ],
  },
  {
    heading: "Modules",
    items: [
      { href: "/research", icon: "◊", label: "Research" },
      { href: "/diligence", icon: "⊞", label: "Diligence" },
      { href: "/review", icon: "▤", label: "Review" },
      { href: "/playbooks", icon: "❏", label: "Playbooks" },
      { href: "/draft", icon: "✎", label: "Draft" },
    ],
  },
  {
    heading: "Admin",
    items: [
      { href: "/connect", icon: "⚿", label: "Connect" },
      { href: "/settings", icon: "⚙", label: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Enclave<span style={{ color: "var(--accent)" }}>.</span>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <div className="sidebar-section">{section.heading}</div>
          {section.items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${active ? " active" : ""}`}
              >
                <span className="ico">{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="sidebar-footer">
        <div style={{ color: "var(--text-muted)" }}>Acme Legal · prod</div>
        <div>Deployed in your VPC</div>
      </div>
    </aside>
  );
}
