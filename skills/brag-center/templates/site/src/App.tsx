import { projectBySlug, story } from "./content/story";
import { isPrint, printProject, useRoute } from "./lib/route";
import { Home } from "./pages/Home";
import { CaseStudy } from "./pages/CaseStudy";

export function App() {
  const route = useRoute();

  if (isPrint) {
    const single = printProject ? projectBySlug(printProject) : undefined;
    return single ? (
      <CaseStudy project={single} />
    ) : (
      <>
        <Home />
        {story.projects.map((p) => (
          <CaseStudy key={p.slug} project={p} />
        ))}
      </>
    );
  }

  if (route.name === "work") {
    const project = projectBySlug(route.slug);
    if (project) return <CaseStudy project={project} />;
  }
  return <Home />;
}
