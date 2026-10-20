import { Nav } from "./components/Nav";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { Install } from "./sections/Install";
import { Run } from "./sections/Run";
import { Sources } from "./sections/Sources";
import { Stats } from "./sections/Stats";
import { UnderTheHood } from "./sections/UnderTheHood";

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Sources />
        <UnderTheHood />
        <Run />
        <Install />
      </main>
      <Footer />
    </>
  );
}
