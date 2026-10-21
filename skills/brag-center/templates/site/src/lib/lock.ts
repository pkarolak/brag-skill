// Client side of vite-plugin-lock: unlock with the password, decrypt protected content and media on demand.
// Render every media file through useAsset() (Media and ProofGallery already do) or it won't load once locked.
import { useEffect, useState } from "react";
import data from "virtual:brag-story";
import { asset, replaceStory, story, type Story } from "../content/story";

const box = data.locked ? data.box : null;
export const lockScope = data.locked ? data.scope : null;

if (!data.locked && data.unprotected) {
  const bar = document.createElement("div");
  bar.setAttribute("data-unprotected", "");
  bar.setAttribute("role", "status");
  bar.textContent = "Dev preview: password not enforced. Share only the BRAG_PASSWORD build (site/dist).";
  bar.style.cssText =
    "position:fixed;inset:auto 0 0 0;z-index:2147483647;padding:10px 16px;background:#b00020;color:#fff;font:600 14px/1.4 system-ui,sans-serif;text-align:center";
  const style = document.createElement("style");
  style.textContent = "@media print{[data-unprotected]{display:none!important}}";
  document.head.append(style);
  document.body.append(bar);
}

let key: CryptoKey | null = null;
let files: Record<string, string> = {};
const listeners = new Set<() => void>();
const SESSION = box ? `brag-key:${box.salt}` : "";

const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const tob64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));

export const isLocked = () => !!box && !key;

async function open(k: CryptoKey) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box!.iv) }, k, unb64(box!.data));
  const { sealed, files: f } = JSON.parse(new TextDecoder().decode(plain)) as { sealed: Partial<Story>; files: Record<string, string> };
  replaceStory(lockScope === "site" ? (sealed as Story) : { ...story, ...sealed });
  files = f;
  key = k;
  listeners.forEach((l) => l());
}

/** Resolves false on a wrong password. */
export async function unlock(password: string): Promise<boolean> {
  if (!box) return true;
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const k = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: unb64(box.salt), iterations: box.iterations, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );
  try {
    await open(k);
  } catch {
    return false;
  }
  try {
    sessionStorage.setItem(SESSION, tob64(await crypto.subtle.exportKey("raw", k)));
  } catch {
    /* private mode: ask again next visit */
  }
  return true;
}

/** Reuse this tab's key so navigation and reloads don't ask again. */
export async function resume() {
  const saved = box ? sessionStorage.getItem(SESSION) : null;
  if (!saved) return;
  try {
    await open(await crypto.subtle.importKey("raw", unb64(saved), "AES-GCM", true, ["decrypt"]));
  } catch {
    sessionStorage.removeItem(SESSION);
  }
}

export function relock() {
  if (SESSION) sessionStorage.removeItem(SESSION);
  location.reload();
}

export function useLock() {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { locked: isLocked(), scope: lockScope };
}

const types: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif",
  svg: "image/svg+xml", avif: "image/avif", mp4: "video/mp4", webm: "video/webm",
};
const cache = new Map<string, Promise<string>>();

async function decryptFile(rel: string, enc: string) {
  const buf = new Uint8Array(await (await fetch(asset(enc))).arrayBuffer());
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, key!, buf.slice(12));
  return URL.createObjectURL(new Blob([plain], { type: types[rel.split(".").pop()!.toLowerCase()] ?? "" }));
}

/** URL for a media path: plain for public files, a decrypted blob URL for protected ones. */
export function useAsset(src?: string): string | undefined {
  const rel = src?.replace(/^\//, "");
  const enc = rel ? files[rel] : undefined;
  const [url, setUrl] = useState(() => (src && !enc ? asset(src) : undefined));
  useEffect(() => {
    if (!src || !rel) return setUrl(undefined);
    if (!enc) return setUrl(asset(src));
    if (!key) return;
    let live = true;
    if (!cache.has(rel)) cache.set(rel, decryptFile(rel, enc));
    cache.get(rel)!.then((u) => live && setUrl(u), () => live && setUrl(undefined));
    return () => {
      live = false;
    };
  }, [src, rel, enc]);
  return url;
}
