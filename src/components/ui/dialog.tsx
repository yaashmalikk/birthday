import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({
  children,
  open = false,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange ?? (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const { onOpenChange } = React.useContext(DialogContext);
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      onOpenChange(true);
    },
  });
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Modern light-dismiss fallback for browsers without closedby support
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInside) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as any)}
      onClick={handleBackdropClick}
      onClose={() => onOpenChange(false)}
      className={cn(
        "fixed inset-0 m-auto z-50 w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#12132C]/95 p-6 text-pink-100 shadow-2xl backdrop-blur-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 outline-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-lg p-1 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </dialog>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-5", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-bold tracking-tight text-white", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-purple-200/70", className)}
      {...props}
    />
  );
}
