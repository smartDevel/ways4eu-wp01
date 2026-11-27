import { NextResponse } from "next/server";
import { getPostsByIds, postTerms } from "@/lib/wp";

export async function GET(request) {
  const ids = (new URL(request.url).searchParams.get("ids") || "")
    .split(",")
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, 100);

  if (ids.length === 0) {
    return NextResponse.json({ error: "At least one valid post ID is required." }, { status: 400 });
  }

  try {
    const termsOnly = new URL(request.url).searchParams.get("mode") === "terms";
    const posts = await getPostsByIds(ids, { includeContent: !termsOnly });
    return NextResponse.json(posts.map((post) => ({
      id: post.id,
      ...(!termsOnly && { content: post.content?.rendered || "" }),
      ...postTerms(post),
    })));
  } catch {
    return NextResponse.json({ error: "Posts are temporarily unavailable." }, { status: 502 });
  }
}
