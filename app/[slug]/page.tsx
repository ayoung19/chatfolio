import { PortfolioPage } from "../components/PortfolioPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <PortfolioPage slug={slug} />;
}
