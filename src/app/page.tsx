import { Hero } from "@/components/home/hero";
import { Featured } from "@/components/home/featured";
import { AboutStrip } from "@/components/home/about-strip";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramFeed } from "@/components/home/instagram";
import { ReservationForm } from "@/components/home/reservation-form";
import { Visit } from "@/components/home/visit";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutStrip />
      <Featured />
      <Testimonials />
      <InstagramFeed />
      <ReservationForm />
      <Visit />
    </>
  );
}
