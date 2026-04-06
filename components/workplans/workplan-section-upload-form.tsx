"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UploadedFile = {
  path: string;
  fileName: string;
  uploadedAt?: string;
  signedUrl?: string;
};

export function WorkplanSectionUploadForm({
  workplanId,
  sectionKey,
  title,
  existingFiles
}: {
  workplanId: string;
  sectionKey: string;
  title: string;
  existingFiles: UploadedFile[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("sectionKey", sectionKey);
    formData.append("title", title);

    try {
      const response = await fetch(`/api/workplans/${workplanId}/files`, {
        method: "POST",
        body: formData
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Uploaden mislukt.");
      }

      event.currentTarget.reset();
      setMessage("Bestand toegevoegd.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-[22px] border border-line bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Uploads</p>
          <p className="mt-1 text-sm text-ink/65">Voeg hier bijlagen of foto’s toe die bij deze sectie horen.</p>
        </div>
        <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink/60">
          {existingFiles.length} bestand{existingFiles.length === 1 ? "" : "en"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="file" name="file" className="rounded-2xl border border-line bg-white px-4 py-3 outline-none" required />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Uploaden..." : "Bestand toevoegen"}
        </button>
      </form>

      {existingFiles.length > 0 ? (
        <div className="grid gap-2">
          {existingFiles.map((file) => (
            <a
              key={`${file.path}-${file.uploadedAt ?? ""}`}
              href={file.signedUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="rounded-[18px] border border-line bg-mist/60 px-4 py-3 text-sm text-ink/70"
            >
              <span className="font-semibold text-forest">{file.fileName}</span>
              {file.uploadedAt ? <span className="ml-2 text-ink/50">· {new Date(file.uploadedAt).toLocaleDateString("nl-NL")}</span> : null}
            </a>
          ))}
        </div>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
