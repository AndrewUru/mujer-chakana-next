import { privateMetadata } from "@/lib/seo";
import MoonboardPage from "@/components/moonboard/MoonboardPage";
export const metadata = { ...privateMetadata, title: "Tu observatorio lunar" };
export default function Page() { return <MoonboardPage />; }
