import { Header } from "@/components/header";
import { Policies } from "@/components/policies";
import { Footer } from "@/components/footer";

export default function PoliciesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Policies />
      <Footer />
    </main>
  );
}