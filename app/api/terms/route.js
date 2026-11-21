import { NextResponse } from "next/server";
import { searchTerms } from "@/lib/wp";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const taxonomy = searchParams.get("taxonomy");
  const query = searchParams.get("q")?.trim() || "";

  if ((taxonomy !== "tag" && taxonomy !== "category") || query.length < 2) {
    return NextResponse.json([]);
  }

  const terms = await searchTerms(taxonomy, query);
  return NextResponse.json(
    terms.map(({ id, name, slug, count }) => ({ id, name, slug, count })),
  );
}
