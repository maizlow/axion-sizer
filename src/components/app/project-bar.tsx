import { useRef, useState } from "react";
import { FolderOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildProject, fileNameFor, parseProject } from "@/lib/sizing/project-file";
import { useT } from "@/lib/i18n/locale";
import { useSizingStore } from "@/store/sizing-store";

export function ProjectBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [asking, setAsking] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const projectName = useSizingStore((s) => s.projectName);
  const setProjectName = useSizingStore((s) => s.setProjectName);
  const loadProject = useSizingStore((s) => s.loadProject);
  const t = useT();

  function openSave() {
    setDraftName(projectName === "Untitled" || projectName === t("untitled") ? "" : projectName);
    setAsking(true);
    setStatus(null);
  }

  function confirmSave() {
    const name = draftName.trim() || t("untitled");
    const snap = useSizingStore.getState();
    const project = buildProject(name, {
      applicationId: snap.applicationId,
      inputs: snap.inputs,
      cycle: snap.cycle,
      motorKinds: snap.motorKinds,
      gearboxKinds: snap.gearboxKinds,
      selectedMatchId: snap.selectedMatchId,
    });
    setProjectName(name);
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileNameFor(name);
    a.click();
    URL.revokeObjectURL(url);
    setAsking(false);
    setStatus(t("save.saved", { name: fileNameFor(name) }));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const project = parseProject(text);
      loadProject(project);
      setStatus(t("save.loaded", { name: project.name }));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t("save.unread"));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline" title={projectName}>
        {projectName}
      </span>
      <Button type="button" size="sm" variant="outline" onClick={openSave}>
        <Save className="size-3.5" />
        {t("save")}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
        <FolderOpen className="size-3.5" />
        {t("load")}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.axion.json,application/json"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {asking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 px-4">
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-lg">
            <h2 className="text-sm font-medium">{t("save.title")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("save.hint")}</p>
            <input
              autoFocus
              className="mt-3 h-10 w-full rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm"
              value={draftName}
              placeholder={t("save.placeholder")}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave();
                if (e.key === "Escape") setAsking(false);
              }}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setAsking(false)}>
                {t("save.cancel")}
              </Button>
              <Button type="button" size="sm" onClick={confirmSave}>
                {t("save.download")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {status && <span className="text-[11px] text-muted-foreground">{status}</span>}
    </div>
  );
}
