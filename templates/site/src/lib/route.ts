import { useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "work"; slug: string };

const params = new URLSearchParams(window.location.search);
export const isPrint = params.has("print");
export const printProject = params.get("project");

export function parseRoute(hash = window.location.hash): Route {
  const m = hash.match(/^#\/work\/([a-z0-9-]+)/);
  return m ? { name: "work", slug: m[1] } : { name: "home" };
}

export const hrefFor = (r: Route) => (r.name === "work" ? `#/work/${r.slug}` : "#/");

export function useRoute(): Route {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
