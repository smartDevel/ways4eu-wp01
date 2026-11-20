const API =
  "https://public-api.wordpress.com/wp/v2/sites/ways4eu.wordpress.com";

async function wpFetch(endpoint, params = {}) {
  const url = new URL(`${API}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 404
    ) {
      return null;
    }
    throw new Error(`WordPress request failed: ${response.status}`);
  }

  return {
    data: await response.json(),
    totalPages: Number(response.headers.get("x-wp-totalpages") || 1),
  };
}

export async function getPosts({ page = 1, category, tag, author } = {}) {
  return wpFetch("posts", {
    page,
    per_page: 10,
    categories: category,
    tags: tag,
    author,
    _embed: 1,
  });
}

export async function getPost(slug) {
  const result = await wpFetch("posts", { slug, per_page: 1, _embed: 1 });
  return result?.data?.[0] || null;
}

export async function getPage(slug) {
  const result = await wpFetch("pages", { slug, per_page: 1, _embed: 1 });
  return result?.data?.[0] || null;
}

export async function getTerm(taxonomy, slug) {
  const endpoint = taxonomy === "category" ? "categories" : "tags";
  const result = await wpFetch(endpoint, { slug, per_page: 1 });
  return result?.data?.[0] || null;
}

export async function getAuthor(slug) {
  // WordPress.com protects the users collection even though authors are
  // included in public post responses. Resolve the slug from embedded author
  // records, then use its numeric ID for the archive request.
  const result = await wpFetch("posts", {
    per_page: 50,
    _embed: "author",
    _fields: "author,_links,_embedded",
  });
  if (!result) return null;

  for (const post of result.data) {
    const author = postAuthor(post);
    if (author?.slug === slug) return author;
  }

  return null;
}

export function postAuthor(post) {
  return post?._embedded?.author?.[0] || null;
}

export function internalPath(link) {
  try {
    const url = new URL(link);
    return url.hostname === "ways4eu.wordpress.com" ? url.pathname : link;
  } catch {
    return link;
  }
}
