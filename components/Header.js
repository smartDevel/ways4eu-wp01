"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { menu, site } from "@/lib/config";

export default function Header() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-title">
          <h2>{site.title}</h2>
        </Link>
        <h4>{site.description}</h4>
        <div className="button-row" aria-label="Color scheme">
          <button type="button" className={!dark ? "selected" : ""} aria-pressed={!dark} onClick={() => setDark(false)}>
            Light
          </button>
          <button type="button" className={dark ? "selected" : ""} aria-pressed={dark} onClick={() => setDark(true)}>
            Dark
          </button>
        </div>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          {open ? "×" : "☰"}
        </button>
      </div>
      <Navigation pathname={pathname} className="desktop-nav" />
      {open && <div className="mobile-menu"><Navigation pathname={pathname} onNavigate={() => setOpen(false)} /></div>}
    </header>
  );
}

function Navigation({ pathname, className = "", onNavigate }) {
  return (
    <nav className={className} aria-label="Primary navigation">
      {menu.map(([label, href]) => (
        <Link key={label} href={href} onClick={onNavigate} aria-current={normalize(pathname) === normalize(href) ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

function normalize(path) {
  return path === "/" ? path : `${path.replace(/\/$/, "")}/`;
}
