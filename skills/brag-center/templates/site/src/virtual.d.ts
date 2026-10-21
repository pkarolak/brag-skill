declare module "virtual:brag-story" {
  type Box = { v: 1; kdf: "PBKDF2-SHA256"; iterations: number; salt: string; iv: string; data: string };
  const data:
    | { locked: false; story: Record<string, unknown> }
    | { locked: true; scope: "case-studies" | "site"; preview: Record<string, unknown>; box: Box };
  export default data;
}
