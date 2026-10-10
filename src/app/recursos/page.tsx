import { getPublicResources } from "@/lib/public-resources";
import LibraryContent from "./library-content";

export default async function RecursosPage() {
  const resources = await getPublicResources();
  return <LibraryContent initialResources={resources} />;
}
