import { HomeContent } from "@/features/catalog/components/home-content";
import { listProducts, listFarms } from "@/features/catalog/server/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [catalog, farms] = await Promise.all([
    listProducts({ limit: 8, offset: 0 }),
    listFarms(),
  ]);
  return <HomeContent products={catalog.data} farms={farms} />;
}
