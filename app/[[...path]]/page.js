import Link from "next/link";
import { notFound } from "next/navigation";
import DisqusComments from "@/components/DisqusComments";
import ListView, { PostMeta } from "@/components/ListView";
import { site } from "@/lib/config";
import { getAuthor, getPage, getPost, getPosts, getStickyPosts, getTerm, internalPath } from "@/lib/wp";

export async function generateMetadata({ params }) {
  const { path = [] } = await params;
  const route = classify(path);

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

  return { title: { absolute: site.title } };
}

export default async function CatchAllPage({ params }) {
  const { path = [] } = await params;
  const route = classify(path);

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
      <ListView posts={archive.posts} featuredPosts={archive.featuredPosts} />
      <Pagination route={route} totalPages={archive.totalPages} />
    </section>
  );
}

async function resolveArchive(route) {
  if (route.kind === "home") {
    const [result, featured] = await Promise.all([
      getPosts({ page: route.page, sticky: false }),
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
    const result = await getPosts({ page: route.page, [route.taxonomy]: term.id });
    return result && {
      posts: result.data,
      totalPages: result.totalPages,
      heading: <>{route.taxonomy}: <b>{term.name}</b></>,
    };
  }

  if (route.kind === "author") {
    const author = await getAuthor(route.slug);
    if (!author) return null;
    const result = await getPosts({ page: route.page, author: author.id });
    return result && {
      posts: result.data,
      totalPages: result.totalPages,
      heading: <>Author: <b>{author.name}</b></>,
    };
  }

  return null;
}

function SinglePost({ post, path }) {
  return (
    <article className="content-container single-post">
      <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
      <PostMeta post={post} />
      <div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      <DisqusComments identifier={post.id} title={stripHtml(post.title.rendered)} path={path} />
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
  const base = route.kind === "home" ? "" : route.kind === "taxonomy"
    ? `/${route.taxonomy}/${route.slug}`
    : `/author/${route.slug}`;
  return page === 1 ? `${base || "/"}/`.replace("//", "/") : `${base}/page/${page}/`;
}

function classify(path) {
  const parts = path.filter(Boolean);
  const pageIndex = parts.indexOf("page");
  const page = pageIndex >= 0 && /^\d+$/.test(parts[pageIndex + 1] || "") ? Number(parts[pageIndex + 1]) : 1;
  const base = pageIndex >= 0 ? parts.slice(0, pageIndex) : parts;

  if (base.length === 0) return { kind: "home", page };
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
