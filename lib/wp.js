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

export async function getPosts({ page = 1, perPage = 10, category, tag, author, sticky, search } = {}) {
  return wpFetch("posts", {
    page,
    per_page: perPage,
    categories: category,
    tags: tag,
    author,
    sticky,
    search,
    _embed: "wp:term",
    _fields: "id,date,link,title,excerpt,categories,tags,_links,_embedded",
  });
}

export async function getPostsByIds(ids, { includeContent = true } = {}) {
  const normalizedIds = [...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (normalizedIds.length === 0) return [];
  const result = await wpFetch("posts", {
    include: normalizedIds.join(","),
    per_page: Math.min(normalizedIds.length, 100),
    _embed: "wp:term",
    _fields: includeContent
      ? "id,content,categories,tags,_links,_embedded"
      : "id,categories,tags,_links,_embedded",
  });
  return result?.data || [];
}

export async function getCategories() {
  const result = await wpFetch("categories", {
    page: 1,
    per_page: 100,
    hide_empty: true,
    orderby: "name",
    order: "asc",
  });
  return result?.data || [];
}

export async function searchTerms(taxonomy, search, perPage = 12) {
  const endpoint = taxonomy === "category" ? "categories" : "tags";
  const result = await wpFetch(endpoint, {
    search,
    per_page: Math.min(Math.max(perPage, 1), 25),
    hide_empty: true,
    orderby: "count",
    order: "desc",
  });
  return result?.data || [];
}

export async function getPopularTags(perPage = 48) {
  try {
    const result = await wpFetch("tags", {
      page: 1,
      per_page: Math.min(Math.max(perPage, 1), 100),
      hide_empty: true,
      orderby: "count",
      order: "desc",
      _fields: "id,name,slug,count",
    });
    return result?.data || [];
  } catch {
    // The archive remains usable if the supplementary cloud is unavailable.
    return [];
  }
}

export async function getStickyPosts() {
  return wpFetch("posts", {
    sticky: true,
    per_page: 10,
    _embed: "wp:term",
    _fields: "id,date,link,title,excerpt,categories,tags,_links,_embedded",
  });
}

export async function getPost(slug) {
  const result = await wpFetch("posts", { slug, per_page: 1, _embed: 1 });
  return result?.data?.[0] || null;
}

export async function getComments(postId) {
  try {
    const result = await wpFetch("comments", {
      post: postId,
      page: 1,
      per_page: 100,
      order: "asc",
      orderby: "date_gmt",
      _fields: "id,parent,author_name,date_gmt,content,link",
    });
    return result?.data || [];
  } catch {
    // Comments are supplementary. A temporary API failure must not make the
    // article itself unavailable.
    return null;
  }
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

export function postTerms(post) {
  const groups = post?._embedded?.["wp:term"];
  if (!Array.isArray(groups)) return { categories: [], tags: [] };

  const terms = groups.flat().filter((term) => term?.id && term?.slug && term?.name);
  return {
    categories: uniqueTerms(terms.filter((term) => term.taxonomy === "category")),
    tags: uniqueTerms(terms.filter((term) => term.taxonomy === "post_tag")),
  };
}

function uniqueTerms(terms) {
  return [...new Map(terms.map((term) => [term.id, {
    id: Number(term.id),
    name: term.name,
    slug: term.slug,
  }])).values()];
}

export function internalPath(link) {
  try {
    const url = new URL(link);
    return url.hostname === "ways4eu.wordpress.com" ? url.pathname : link;
  } catch {
    return link;
  }
}
