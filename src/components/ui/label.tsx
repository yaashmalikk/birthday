import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-xs font-semibold uppercase tracking-wider text-purple-200/80 mb-1.5 block", className)}
      {...props}
    />
  );
}
