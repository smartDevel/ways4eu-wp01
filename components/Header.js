"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useFavorites } from "@/components/FavoritesProvider";
import { externalLinks, site, socialLinks } from "@/lib/config";

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const { count, ready } = useFavorites();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const closeMobile = () => setMobileOpen(false);

  function toggleBrowse() {
    setBrowseOpen((value) => !value);
    setLinksOpen(false);
  }

  function toggleLinks() {
    setLinksOpen((value) => !value);
    setBrowseOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-block">
          <Link href="/" className="site-title" aria-label={`${site.title}, home`}>
            <span>CurioSphere</span><strong>@Vercel</strong>
          </Link>
          <p className="site-description">{site.description}</p>
        </div>

        <div className="header-tools">
          <SocialLinks className="header-social" />
          <ThemeSwitch dark={dark} setDark={setDark} />
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? "×" : "☰"}
        </button>
      </div>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/" aria-current={normalize(pathname) === "/" ? "page" : undefined}>Home</Link>
        <FavoritesLink pathname={pathname} count={count} ready={ready} />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={browseOpen}
          aria-controls="desktop-browse-panel"
          onClick={toggleBrowse}
        >
          Browse &amp; search <Chevron />
        </button>
        <div className="nav-menu-item">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={linksOpen}
            aria-controls="desktop-links-menu"
            onClick={toggleLinks}
          >
            Links <Chevron />
          </button>
          {linksOpen && <ExternalLinks id="desktop-links-menu" className="desktop-links-menu" onNavigate={() => setLinksOpen(false)} />}
        </div>
      </nav>

      {browseOpen && (
        <div id="desktop-browse-panel" className="browse-panel desktop-browse-panel">
          <BrowseFilters categories={categories} onNavigate={() => setBrowseOpen(false)} idPrefix="desktop" />
        </div>
      )}

      {mobileOpen && (
        <div id="mobile-navigation" className="mobile-menu">
          <nav aria-label="Mobile navigation">
            <Link href="/" onClick={closeMobile} aria-current={normalize(pathname) === "/" ? "page" : undefined}>Home</Link>
            <FavoritesLink pathname={pathname} count={count} ready={ready} onClick={closeMobile} />
            <button type="button" className="mobile-links-toggle" aria-expanded={linksOpen} aria-controls="mobile-links-menu" onClick={() => setLinksOpen((value) => !value)}>
              Links <Chevron />
            </button>
            {linksOpen && <ExternalLinks id="mobile-links-menu" className="mobile-links-menu" onNavigate={closeMobile} />}
            <h2 className="mobile-browse-heading">Browse &amp; search</h2>
            <BrowseFilters categories={categories} onNavigate={closeMobile} idPrefix="mobile" />
            <div className="mobile-theme"><ThemeSwitch dark={dark} setDark={setDark} /></div>
            <SocialLinks className="mobile-social" />
          </nav>
        </div>
      )}
    </header>
  );
}

function FavoritesLink({ pathname, count, ready, onClick }) {
  const label = ready ? `Favorites, ${count} saved ${count === 1 ? "post" : "posts"}` : "Favorites";
  return (
    <Link
      href="/favorites/"
      className="favorites-nav-link"
      aria-current={normalize(pathname) === "/favorites/" ? "page" : undefined}
      aria-label={label}
      onClick={onClick}
    >
      <span>Favorites</span>
      {ready && count > 0 && <span className="favorites-count" aria-hidden="true">{count}</span>}
    </Link>
  );
}

function BrowseFilters({ categories, onNavigate, idPrefix }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function navigate(event) {
    const href = event.target.value;
    if (!href) return;
    router.push(href);
    onNavigate?.();
  }

  function search(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search/?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  }

  return (
    <div className="browse-filters">
      <form className="post-search" onSubmit={search}>
        <label htmlFor={`${idPrefix}-post-search`}>Search posts</label>
        <div className="search-control">
          <input id={`${idPrefix}-post-search`} name="q" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Enter keywords…" required />
          <button type="submit">Search</button>
        </div>
      </form>

      <label className="filter-field" htmlFor={`${idPrefix}-category-filter`}>
        Category
        <select id={`${idPrefix}-category-filter`} defaultValue="" onChange={navigate}>
          <option value="">Choose a category…</option>
          {categories.map((category) => (
            <option key={category.id} value={`/category/${category.slug}/`}>
              {category.name} ({category.count})
            </option>
          ))}
        </select>
      </label>

      <TagFilter onNavigate={onNavigate} idPrefix={idPrefix} />
    </div>
  );
}

function TagFilter({ onNavigate, idPrefix }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [terms, setTerms] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/terms/?taxonomy=tag&q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (response.ok) setTerms(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") setMessage("Tag suggestions are temporarily unavailable.");
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function submit(event) {
    event.preventDefault();
    const normalized = query.trim().toLocaleLowerCase();
    const term = terms.find((item) => item.name.toLocaleLowerCase() === normalized || item.slug.toLocaleLowerCase() === normalized);
    if (!term) {
      setMessage("Select a suggested tag.");
      return;
    }
    setMessage("");
    router.push(`/tag/${term.slug}/`);
    onNavigate?.();
  }

  return (
    <form className="tag-filter" onSubmit={submit}>
      <label htmlFor={`${idPrefix}-tag-filter`}>Tag</label>
      <div className="search-control">
        <input
          id={`${idPrefix}-tag-filter`}
          type="search"
          list={listId}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setMessage(""); }}
          placeholder="Type at least 2 letters…"
          autoComplete="off"
          required
        />
        <datalist id={listId}>
          {terms.map((term) => <option key={term.id} value={term.name}>{term.count} posts</option>)}
        </datalist>
        <button type="submit">Filter</button>
      </div>
      <span className="filter-message" role="status">{message}</span>
    </form>
  );
}

function ExternalLinks({ id, className, onNavigate }) {
  return (
    <div id={id} className={className}>
      {externalLinks.map(([label, href]) => (
        <a key={href} href={href} target="_blank" rel="noreferrer" onClick={onNavigate}>
          <span>{label}</span><span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

function SocialLinks({ className }) {
  return (
    <div className={`social-links ${className}`} aria-label="Social media">
      {socialLinks.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <SocialIcon name={label} />
        </a>
      ))}
    </div>
  );
}

function ThemeSwitch({ dark, setDark }) {
  return (
    <div className="theme-switch" aria-label="Color scheme">
      <button type="button" className={!dark ? "selected" : ""} aria-pressed={!dark} onClick={() => setDark(false)}>Light</button>
      <button type="button" className={dark ? "selected" : ""} aria-pressed={dark} onClick={() => setDark(true)}>Dark</button>
    </div>
  );
}

function SocialIcon({ name }) {
  if (name === "Facebook") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.3H6.7V13h3.1v9h3.8Z" /></svg>;
  }
  if (name === "Instagram") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M7.1 2h9.8A5.1 5.1 0 0 1 22 7.1v9.8a5.1 5.1 0 0 1-5.1 5.1H7.1A5.1 5.1 0 0 1 2 16.9V7.1A5.1 5.1 0 0 1 7.1 2Zm-.2 2A2.9 2.9 0 0 0 4 6.9v10.2A2.9 2.9 0 0 0 6.9 20h10.2a2.9 2.9 0 0 0 2.9-2.9V6.9A2.9 2.9 0 0 0 17.1 4H6.9ZM12 7.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.2-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" clipRule="evenodd" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 2c.3 2.4 1.7 3.8 4.2 4v3.1a9 9 0 0 1-4.2-1v6.2a7.2 7.2 0 1 1-6.2-7.1v3.2a4 4 0 1 0 3 3.9V2h3.2Z" /></svg>;
}

function Chevron() {
  return <span className="chevron" aria-hidden="true">▾</span>;
}

function normalize(path) {
  return path === "/" ? path : `${path.replace(/\/$/, "")}/`;
}
