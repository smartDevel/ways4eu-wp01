import { NextResponse } from "next/server";
import { getPostsByIds } from "@/lib/wp";

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
    const posts = await getPostsByIds(ids);
    return NextResponse.json(posts.map((post) => ({
      id: post.id,
      content: post.content?.rendered || "",
    })));
  } catch {
    return NextResponse.json({ error: "Posts are temporarily unavailable." }, { status: 502 });
  }
}
