import { redirect } from "next/navigation";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Legacy route — home now lives at /today. Preserves query params (e.g. ?initiated=true). */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  redirect(query ? `/today?${query}` : "/today");
}
