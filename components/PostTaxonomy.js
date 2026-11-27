import Link from "next/link";
import { postTerms } from "@/lib/wp";

export default function PostTaxonomy({ post, terms = postTerms(post), perPage = 10 }) {
  const categories = normalizeTerms(terms?.categories);
  const tags = normalizeTerms(terms?.tags);

  if (categories.length === 0 && tags.length === 0) return null;

  return (
    <div className="post-taxonomy" aria-label="Post categories and tags">
      {categories.length > 0 && (
        <TermGroup label="Categories" taxonomy="category" terms={categories} perPage={perPage} />
      )}
      {tags.length > 0 && (
        <TermGroup label="Tags" taxonomy="tag" terms={tags} perPage={perPage} />
      )}
    </div>
  );
}

function TermGroup({ label, taxonomy, terms, perPage }) {
  return (
    <div className="taxonomy-group">
      <span className="taxonomy-label">{label}</span>
      <ul className="taxonomy-list">
        {terms.map((term) => (
          <li key={`${taxonomy}-${term.id}`}>
            <Link href={`/${taxonomy}/${term.slug}/?perPage=${perPage}`}>
              {decodeEntities(term.name)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function normalizeTerms(terms) {
  if (!Array.isArray(terms)) return [];
  return [...new Map(terms
    .filter((term) => term?.id && term?.slug && term?.name)
    .map((term) => [Number(term.id), {
      id: Number(term.id),
      name: String(term.name),
      slug: String(term.slug),
    }])).values()];
}

export function decodeEntities(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    hellip: "…",
    lt: "<",
    nbsp: " ",
    quot: '"',
    rsquo: "’",
  };
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}
