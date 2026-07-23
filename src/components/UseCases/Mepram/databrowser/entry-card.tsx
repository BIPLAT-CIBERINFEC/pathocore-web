import type { ComponentType } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EntryCardContent } from "@/types/databrowser";

interface EntryCardProps {
  compact?: boolean;
  icon: ComponentType<{ className?: string | undefined }>;
  item: EntryCardContent;
  to: string;
}

export function EntryCard({ compact = false, icon: Icon, item, to }: EntryCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={to}>
        <Card className="group h-full rounded-[2rem] border-white/60 bg-white/90 transition-all hover:shadow-glow">
          <CardHeader className={compact ? "space-y-3 p-5 pb-3" : undefined}>
            <div className="flex items-start justify-between gap-4">
              <div
                className={
                  compact
                    ? "flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-slate-100"
                    : "flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-slate-100"
                }
              >
                <Icon className={compact ? "h-[18px] w-[18px] text-slate-800" : "h-5 w-5 text-slate-800"} />
              </div>
              <Badge variant="outline">{item.stat}</Badge>
            </div>
            <CardTitle className={compact ? "pt-2 text-[1.2rem]" : "pt-4 text-[1.45rem]"}>
              {item.title}
            </CardTitle>
            <CardDescription className={compact ? "text-[13px] leading-6 text-slate-500" : "text-sm text-slate-500"}>
              {item.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className={compact ? "flex h-full flex-col p-5 pt-0" : "flex h-full flex-col"}>
            <p className={compact ? "text-sm leading-6 text-slate-600" : "text-sm leading-7 text-slate-600"}>
              {item.description}
            </p>
            <div className={compact ? "mt-4 flex flex-wrap gap-2" : "mt-5 flex flex-wrap gap-2"}>
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div
              className={
                compact
                  ? "mt-5 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  : "mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700"
              }
            >
              Abrir sección
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
