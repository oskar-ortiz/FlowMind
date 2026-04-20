"use client";

import { useState } from "react";
import { useThoughtStore } from "@/store";
import type { ThoughtType, PriorityType } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const TYPE_OPTIONS: { value: ThoughtType; label: string }[] = [
  { value: "idea", label: "💡 Idea" },
  { value: "task", label: "✅ Tarea" },
  { value: "concern", label: "⚠️ Preocupación" },
  { value: "noise", label: "☁️ Ruido" },
];

const PRIORITY_OPTIONS: { value: PriorityType; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export function AddThoughtDialog() {
  const addThought = useThoughtStore((s) => s.addThought);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<ThoughtType>("idea");
  const [priority, setPriority] = useState<PriorityType>("medium");

  function resetForm() {
    setContent("");
    setType("idea");
    setPriority("medium");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    addThought({
      content: content.trim(),
      type,
      priority,
      isImportant: false,
    });

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-thought-trigger" className="gap-1.5">
          <Plus className="size-4" />
          Nuevo pensamiento
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Captura un pensamiento</DialogTitle>
          <DialogDescription>
            Escribe lo que sea que esté en tu mente. Clasifícalo después.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Content */}
          <div className="grid gap-2">
            <label
              htmlFor="thought-content"
              className="text-sm font-medium text-foreground"
            >
              ¿Qué tienes en mente?
            </label>
            <Textarea
              id="thought-content"
              placeholder="Escribe aquí tu pensamiento..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="resize-none"
              autoFocus
            />
          </div>

          {/* Type & Priority selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label
                htmlFor="thought-type"
                className="text-sm font-medium text-foreground"
              >
                Tipo
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ThoughtType)}
              >
                <SelectTrigger id="thought-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="thought-priority"
                className="text-sm font-medium text-foreground"
              >
                Prioridad
              </label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as PriorityType)}
              >
                <SelectTrigger id="thought-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!content.trim()}>
              Guardar pensamiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
