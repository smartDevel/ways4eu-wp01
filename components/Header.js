"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { site } from "@/lib/config";

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const closeMobile = () => setMobileOpen(false);

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
        <button
          type="button"
          className="browse-toggle"
          aria-expanded={browseOpen}
          aria-controls="desktop-browse-panel"
          onClick={() => setBrowseOpen((value) => !value)}
        >
          Browse &amp; search <span aria-hidden="true">⌄</span>
        </button>
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
            <BrowseFilters categories={categories} onNavigate={closeMobile} idPrefix="mobile" />
          </nav>
        </div>
      )}
    </header>
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

function normalize(path) {
  return path === "/" ? path : `${path.replace(/\/$/, "")}/`;
}
