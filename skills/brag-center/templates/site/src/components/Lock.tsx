// Baseline password screen. Restyle per DESIGN.md; keep data-lock, the password input, and the unlock() call.
import { useState } from "react";
import { story } from "../content/story";
import { lockScope, unlock } from "../lib/lock";
import { hrefFor } from "../lib/route";

export function Lock() {
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setWrong(!(await unlock(password)));
    setBusy(false);
  };

  return (
    <main data-lock className="grid min-h-screen place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="text-sm text-[var(--color-muted)]">{story.person.name}</p>
        <h1 className="mt-2 text-3xl leading-tight tracking-tight">
          {lockScope === "site" ? "This portfolio is password protected" : "This case study is password protected"}
        </h1>
        <label htmlFor="brag-password" className="mt-8 block text-sm">
          Password
        </label>
        <input
          id="brag-password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setWrong(false);
          }}
          aria-invalid={wrong}
          aria-describedby={wrong ? "brag-password-error" : undefined}
          className="mt-2 w-full border border-current/30 bg-transparent px-3 py-2"
        />
        {wrong ? (
          <p id="brag-password-error" role="alert" className="mt-2 text-sm">
            That password didn’t work.
          </p>
        ) : null}
        <button type="submit" disabled={busy || !password} className="mt-6 w-full bg-[var(--color-ink)] px-4 py-2 text-[var(--color-ground)] disabled:opacity-50">
          {busy ? "Unlocking…" : "Unlock"}
        </button>
        {lockScope === "case-studies" ? (
          <a href={hrefFor({ name: "home" })} className="mt-6 inline-block text-sm">
            ← Back
          </a>
        ) : null}
      </form>
    </main>
  );
}
