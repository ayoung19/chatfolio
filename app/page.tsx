import { db } from "@/lib/db/admin";
import { PortfolioPage } from "./components/PortfolioPage";

export default async function Home() {
  const portfoliosQuery = await db.query({
    portfolios: {
      $: {
        limit: 1,
        order: { serverCreatedAt: "asc" },
      },
    },
  });

  return <PortfolioPage slug={portfoliosQuery.portfolios[0].slug as string} />;
}
