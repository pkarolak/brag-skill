import { Announcement } from "./components/Announcement";
import { Nav } from "./components/Nav";
import { AddOns } from "./sections/AddOns";
import { Captions } from "./sections/Captions";
import { Craft } from "./sections/Craft";
import { Directions } from "./sections/Directions";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { Install } from "./sections/Install";
import { Run } from "./sections/Run";
import { Sources } from "./sections/Sources";

export function App() {
  return (
    <>
      <Announcement />
      <Nav />
      <main>
        <Hero />
        <Captions />
        <Craft />
        <Directions />
        <AddOns />
        <Sources />
        <Run />
        <Install />
      </main>
      <Footer />
    </>
  );
}
