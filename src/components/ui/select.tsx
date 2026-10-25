import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

export function Select({
  children,
  value = "",
  onValueChange = () => {},
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={containerRef} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-purple-500/20 bg-[#151632]/80 px-4 py-2 text-sm text-pink-100 placeholder:text-purple-300/40 backdrop-blur-md focus:border-pink-500 focus:outline-none transition-all",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || children || placeholder}</span>;
}

export function SelectContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute left-0 top-full mt-2 z-50 w-full min-w-[8rem] overflow-hidden rounded-xl border border-purple-500/30 bg-[#151632] p-1 text-pink-100 shadow-xl backdrop-blur-xl animate-in fade-in-80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-pink-500/20 hover:text-white transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
