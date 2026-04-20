"use client";

import { format } from "@/lib/format";
import type { Thought } from "@/types";
import { useThoughtStore } from "@/store";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  CheckSquare,
  AlertTriangle,
  CloudFog,
  Star,
  Trash2,
  Clock,
} from "lucide-react";

// ── Visual config maps ────────────────────────────────────

const TYPE_CONFIG: Record<
  Thought["type"],
  { label: string; icon: React.ReactNode; className: string }
> = {
  idea: {
    label: "Idea",
    icon: <Lightbulb className="size-3.5" />,
    className:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  },
  task: {
    label: "Tarea",
    icon: <CheckSquare className="size-3.5" />,
    className:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
  },
  concern: {
    label: "Preocupación",
    icon: <AlertTriangle className="size-3.5" />,
    className:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  noise: {
    label: "Ruido",
    icon: <CloudFog className="size-3.5" />,
    className:
      "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400",
  },
};

const PRIORITY_CONFIG: Record<
  Thought["priority"],
  { label: string; className: string }
> = {
  high: {
    label: "Alta",
    className:
      "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400",
  },
  medium: {
    label: "Media",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
  },
  low: {
    label: "Baja",
    className:
      "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400",
  },
};

// ── Component ─────────────────────────────────────────────

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const removeThought = useThoughtStore((s) => s.removeThought);
  const toggleImportant = useThoughtStore((s) => s.toggleImportant);

  const typeConfig = TYPE_CONFIG[thought.type];
  const priorityConfig = PRIORITY_CONFIG[thought.priority];

  return (
    <Card className="group relative transition-all duration-200 hover:ring-foreground/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <Badge
            variant="outline"
            className={`gap-1 border-transparent ${typeConfig.className}`}
          >
            {typeConfig.icon}
            {typeConfig.label}
          </Badge>

          {/* Priority badge */}
          <Badge variant="outline" className={priorityConfig.className}>
            {priorityConfig.label}
          </Badge>
        </div>

        <CardAction>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleImportant(thought.id)}
              className={
                thought.isImportant
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }
              aria-label={
                thought.isImportant
                  ? "Quitar de importantes"
                  : "Marcar como importante"
              }
            >
              <Star
                className={`size-4 ${thought.isImportant ? "fill-amber-500" : ""}`}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeThought(thought.id)}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              aria-label="Eliminar pensamiento"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <CardTitle className="text-sm font-normal leading-relaxed">
          {thought.content}
        </CardTitle>
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent pb-1 pt-0">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {format.relativeDate(thought.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}
