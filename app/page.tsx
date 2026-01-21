import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Booking } from "@/components/booking";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Booking />
      <Footer />
    </main>
  );
}
