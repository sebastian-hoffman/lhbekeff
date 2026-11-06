import { Storefront } from "@/components/shop/storefront";
import { isPresaleOpen } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return <Storefront open={isPresaleOpen()} />;
}
