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
  icon: ComponentType<{ className?: string | undefined }>;
  item: EntryCardContent;
  to: string;
}

export function EntryCard({ icon: Icon, item, to }: EntryCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={to}>
        <Card className="group h-full rounded-[2rem] border-white/60 bg-white/90 transition-all hover:shadow-glow">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-slate-100">
                <Icon className="h-5 w-5 text-slate-800" />
              </div>
              <Badge variant="outline">{item.stat}</Badge>
            </div>
            <CardTitle className="pt-4 text-[1.45rem]">{item.title}</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {item.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col">
            <p className="text-sm leading-7 text-slate-600">{item.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
              Explorar detalle agregado
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
