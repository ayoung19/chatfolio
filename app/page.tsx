import { db } from "@/lib/db/admin";
import { PortfolioPage } from "./components/PortfolioPage";

export default async function Home() {
  const portfoliosQuery = await db.query({
    portfolios: {
      $: {
        limit: 1,
        where: {
          and: [
            { id: { $not: "273e93da-84af-48cd-8b45-1932f9d6c986" } },
            { id: { $not: "38ffd10b-317c-4ba6-b828-8e377aba52c2" } },
          ],
        },
        order: { serverCreatedAt: "desc" },
      },
    },
  });

  return <PortfolioPage slug={portfoliosQuery.portfolios[0].slug} />;
}
