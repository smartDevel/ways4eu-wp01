import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import FavoriteRating from "@/components/FavoriteRating";
import { normalizePageSize } from "@/lib/preferences";
import ListView, { PostMeta } from "@/components/ListView";
import ShareButtons from "@/components/ShareButtons";
import WordPressComments from "@/components/WordPressComments";
import { site } from "@/lib/config";
import { getAuthor, getComments, getPage, getPost, getPosts, getStickyPosts, getTerm, internalPath } from "@/lib/wp";

export async function generateMetadata({ params, searchParams }) {
  const { path = [] } = await params;
  const query = ((await searchParams)?.q || "").trim();
  const route = classify(path, query);

  if (route.kind === "post") {
    const post = await getPost(route.slug);
    if (!post) return {};
    return {
      title: stripHtml(post.title.rendered),
      description: stripHtml(post.excerpt.rendered),
      alternates: { canonical: internalPath(post.link) },
    };
  }

  if (route.kind === "page") {
    const page = await getPage(route.slug);
    if (page) return {
      title: stripHtml(page.title.rendered),
      description: stripHtml(page.excerpt.rendered),
      alternates: { canonical: internalPath(page.link) },
    };
  }

  if (route.kind === "search" && route.query) {
    return { title: `Search: ${route.query}` };
  }

  return { title: { absolute: site.title } };
}

export default async function CatchAllPage({ params, searchParams }) {
  const { path = [] } = await params;
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.q || "").trim();
  const perPage = normalizePageSize(resolvedSearchParams?.perPage);
  const route = { ...classify(path, query), perPage };

  if (route.kind === "post") {
    const post = await getPost(route.slug);
    if (!post) notFound();
    return <SinglePost post={post} path={`/${path.join("/")}/`} />;
  }

  if (route.kind === "page") {
    const page = await getPage(route.slug);
    if (page) return <SinglePage page={page} />;
  }

  const archive = await resolveArchive(route);
  if (!archive) notFound();

  return (
    <section className="content-container">
      {archive.heading && <h3 className="archive-heading">{archive.heading}</h3>}
      <ListView posts={archive.posts} featuredPosts={archive.featuredPosts} postsPerPage={route.perPage} />
      <Pagination route={route} totalPages={archive.totalPages} />
    </section>
  );
}

async function resolveArchive(route) {
  if (route.kind === "home") {
    const [result, featured] = await Promise.all([
      getPosts({ page: route.page, perPage: route.perPage, sticky: false }),
      route.page === 1 ? getStickyPosts() : Promise.resolve(null),
    ]);
    return result && {
      posts: result.data,
      featuredPosts: featured?.data || [],
      totalPages: result.totalPages,
    };
  }

  if (route.kind === "taxonomy") {
    const term = await getTerm(route.taxonomy, route.slug);
    if (!term) return null;
    const result = await getPosts({ page: route.page, perPage: route.perPage, [route.taxonomy]: term.id });
    return result && {
      posts: result.data,
      totalPages: result.totalPages,
      heading: <>{route.taxonomy}: <b>{term.name}</b></>,
    };
  }

  if (route.kind === "author") {
    const author = await getAuthor(route.slug);
    if (!author) return null;
    const result = await getPosts({ page: route.page, perPage: route.perPage, author: author.id });
    return result && {
      posts: result.data,
      totalPages: result.totalPages,
      heading: <>Author: <b>{author.name}</b></>,
    };
  }

  if (route.kind === "search") {
    if (!route.query) {
      return { posts: [], totalPages: 1, heading: <>Search posts</> };
    }
    const result = await getPosts({ page: route.page, perPage: route.perPage, search: route.query });
    return result && {
      posts: result.data,
      totalPages: result.totalPages,
      heading: <>Search results for: <b>{route.query}</b></>,
    };
  }

  return null;
}

async function SinglePost({ post, path }) {
  const author = post._embedded?.author?.[0];
  const comments = await getComments(post.id);
  const favoritePost = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    link: post.link,
    date: post.date,
    author: author ? { name: author.name, link: author.link } : null,
  };

  return (
    <article className="content-container single-post">
      <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <PostMeta post={post} />
      <div className="favorite-actions">
        <FavoriteButton post={favoritePost} />
        <FavoriteRating post={favoritePost} />
      </div>
      <div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      <ShareButtons
        title={stripHtml(post.title.rendered)}
        text={stripHtml(post.excerpt.rendered)}
        url={new URL(path, site.url).href}
      />
      <WordPressComments
        comments={comments}
        commentStatus={post.comment_status}
        postUrl={post.link}
      />
    </article>
  );
}

function SinglePage({ page }) {
  return (
    <article className="content-container single-post">
      <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
      <div className="wp-content" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
    </article>
  );
}

function Pagination({ route, totalPages }) {
  if (totalPages <= 1) return null;
  const page = route.page || 1;
  return (
    <nav className="pagination" aria-label="Pagination">
      {page < totalPages && <Link href={pageHref(route, page + 1)}>← Older posts</Link>}
      {page < totalPages && page > 1 && " - "}
      {page > 1 && <Link href={pageHref(route, page - 1)}>Newer posts →</Link>}
    </nav>
  );
}

function pageHref(route, page) {
  const params = new URLSearchParams({ perPage: String(route.perPage) });
  if (route.kind === "search") {
    const base = page === 1 ? "/search/" : `/search/page/${page}/`;
    params.set("q", route.query);
    return `${base}?${params.toString()}`;
  }
  const base = route.kind === "home" ? "" : route.kind === "taxonomy"
    ? `/${route.taxonomy}/${route.slug}`
    : `/author/${route.slug}`;
  const pathname = page === 1 ? `${base || "/"}/`.replace("//", "/") : `${base}/page/${page}/`;
  return `${pathname}?${params.toString()}`;
}

function classify(path, query = "") {
  const parts = path.filter(Boolean);
  const pageIndex = parts.indexOf("page");
  const page = pageIndex >= 0 && /^\d+$/.test(parts[pageIndex + 1] || "") ? Number(parts[pageIndex + 1]) : 1;
  const base = pageIndex >= 0 ? parts.slice(0, pageIndex) : parts;

  if (base.length === 0) return { kind: "home", page };
  if (base.length === 1 && base[0] === "search") return { kind: "search", query, page };
  if (base.length === 2 && (base[0] === "tag" || base[0] === "category")) {
    return { kind: "taxonomy", taxonomy: base[0], slug: base[1], page };
  }
  if (base.length === 2 && base[0] === "author") return { kind: "author", slug: base[1], page };
  if (base.length >= 4 && /^\d{4}$/.test(base[0]) && /^\d{2}$/.test(base[1]) && /^\d{2}$/.test(base[2])) {
    return { kind: "post", slug: base[3] };
  }
  if (base.length === 1) return { kind: "page", slug: base[0] };
  return { kind: "unknown" };
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").trim();
}
