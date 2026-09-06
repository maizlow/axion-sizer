import { createFileRoute } from "@tanstack/react-router";
import { LibrarianShell } from "@/components/librarian/librarian-shell";

export const Route = createFileRoute("/librarian")({ component: LibrarianShell });
