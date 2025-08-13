import NSortGame from "@/components/NSortGame";
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <main>
      <NSortGame />
      <Analytics />
    </main>
  );
}
