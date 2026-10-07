import { redirect } from "next/navigation";
import { savedAccountId } from "@/lib/store";

// Never statically cached: whether an account is connected can change
// between requests (the account gets connected, or "Forget this account" is
// used), and a static build would freeze whichever was true at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  redirect((await savedAccountId()) ? "/dashboard" : "/connect");
}
