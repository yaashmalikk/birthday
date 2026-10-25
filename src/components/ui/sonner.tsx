import { Toaster as SonnerToaster } from "sonner";

export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: "#151632",
          border: "1px solid rgba(192, 132, 252, 0.25)",
          color: "#F5F3FF",
          borderRadius: "1rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        },
      }}
      {...props}
    />
  );
}
