import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { BadgeCheck, FileSignature, Gift } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import SectionHeading from "./SectionHeading";
import { apiGet, apiPost } from "@/lib/api";
import type { ClaimStatus, GiftClaim } from "@/lib/types";
import { fireConfetti } from "@/lib/confetti";
import { playChime, playFireworks } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TERMS = [
  { icon: "🎁", text: "One (1) pending birthday gift — to be delivered in person, no виртуal excuses." },
  { icon: "🎉", text: "One (1) full birthday party — favorite cafe, cake, the whole celebration." },
  { icon: "🏆", text: "Unlimited hackathon partnership — all-nighters included, trophies expected." },
  { icon: "💼", text: "Co-founder equity locked at 50/50 for the future unicorn startup." },
  { icon: "♾️", text: "Lifetime friendship support — the bestie position has NO vacancy, ever." },
];

export default function ClaimGiftContract() {
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    queryKey: ["claim-status"],
    queryFn: () => apiGet<ClaimStatus>("/claim-status"),
  });
  const [claimedBy, setClaimedBy] = useState("Taniyaaa");
  const [responseNote, setResponseNote] = useState("");
  const [celebrateOpen, setCelebrateOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<GiftClaim>("/claim-gift", {
        claimed_by: claimedBy.trim() || "Taniyaaa",
        response_note: responseNote.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claim-status"] });
      setCelebrateOpen(true);
      playFireworks();
      playChime();
      fireConfetti();
    },
    onError: () => {
      toast.error("The contract office is busy — try again in a moment 🥺");
    },
  });

  const claimed = status?.claimed ?? false;

  return (
    <section id="contract" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          badge="Legally Binding (ish)"
          title="The Gift & Party Contract 🎁"
          subtitle="One click locks it in forever. No excuses accepted."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.6 }}
          className="relative mt-12 overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-amber-950/20 p-6 shadow-[0_0_35px_rgba(255,209,102,0.18)] backdrop-blur-2xl sm:p-9"
          data-testid="gift-contract"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />

          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-300/90">
              Irrevocable Agreement
            </p>
            <h3 className="mt-2 font-heading text-2xl font-black text-amber-50 sm:text-3xl">
              Birthday Party &amp; Treat Contract
            </h3>
            <p className="mt-2 text-sm text-amber-100/70">
              Between: <span className="font-semibold text-amber-200">Your Best Friend 💜</span> and{" "}
              <span className="font-semibold text-amber-200">Taniyaaa (Guuu · Devi ji · Kallo · Rehtal)</span>
            </p>
          </div>

          <ul className="mt-7 flex flex-col gap-3">
            {TERMS.map((t) => (
              <li
                key={t.text}
                className="flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-black/20 px-4 py-3"
              >
                <span className="text-lg" aria-hidden>{t.icon}</span>
                <span className="text-sm leading-relaxed text-amber-50/90">{t.text}</span>
              </li>
            ))}
          </ul>

          {claimed ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center" data-testid="claim-signed-panel">
              <span className="inline-flex rotate-[-4deg] items-center gap-2 rounded-lg border-2 border-emerald-400/70 px-4 py-1.5 font-heading text-xl font-black uppercase tracking-widest text-emerald-300">
                <BadgeCheck className="h-5 w-5" /> Signed
              </span>
              <p className="mt-4 text-sm text-emerald-100/85">
                Signed by <span className="font-bold">{status?.claimed_by ?? "Taniyaaa"}</span>
                {status?.claimed_at
                  ? ` · ${format(new Date(status.claimed_at), "dd MMM yyyy · h:mm a")} (IST)`
                  : ""}
              </p>
              {status?.response_note ? (
                <p className="mt-2 text-sm italic text-emerald-100/70">“{status.response_note}”</p>
              ) : null}
              <Button disabled variant="outline" className="mt-5 border-emerald-400/40 text-emerald-200" data-testid="claim-sealed-btn">
                <Gift className="mr-2 h-4 w-4" /> Contract Sealed — Party Locked ✅
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="claim-name" className="sr-only">Sign as</label>
                <Input
                  id="claim-name"
                  value={claimedBy}
                  onChange={(e) => setClaimedBy(e.target.value)}
                  placeholder="Sign as (your name)"
                  className="border-amber-400/30 bg-black/25 text-amber-50 placeholder:text-amber-200/40"
                  data-testid="claim-name-input"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="claim-note" className="sr-only">Response note</label>
                <Textarea
                  id="claim-note"
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="A note for the record (optional) — e.g. “Deal! But gift first 👀”"
                  rows={1}
                  className="min-h-[42px] border-amber-400/30 bg-black/25 py-2 text-amber-50 placeholder:text-amber-200/40"
                  data-testid="claim-note-input"
                />
              </div>
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                data-testid="claim-gift-btn"
                className="bg-gradient-to-r from-amber-400 to-rose-400 font-black text-[#18132B] shadow-[0_0_30px_rgba(255,209,102,0.4)] transition-transform hover:scale-105"
              >
                <FileSignature className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Signing…" : "Claim Birthday Gift & Confirm Party 🎁"}
              </Button>
            </div>
          )}

          <p className="mt-5 text-center text-[11px] uppercase tracking-[0.3em] text-amber-200/50">
            signed in sparkles · enforceable by friendship law
          </p>
        </motion.div>
      </div>

      {/* celebration modal */}
      <Dialog open={celebrateOpen} onOpenChange={setCelebrateOpen}>
        <DialogContent className="max-w-md border-2 border-amber-400/50 bg-[#18132B] text-center" data-testid="claim-celebration-modal">
          <DialogHeader className="items-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-4xl shadow-[0_0_40px_rgba(255,209,102,0.5)]">
              🎉
            </div>
            <DialogTitle className="mt-3 font-heading text-2xl font-black text-amber-100">
              Contract Signed! 🎉
            </DialogTitle>
            <DialogDescription className="text-base text-amber-100/80">
              Party &amp; Gift are now legally locked in! No excuses accepted.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-amber-100/60">
            The timestamp is on record —{status?.claimed_at ? ` ${format(new Date(status.claimed_at), "dd MMM yyyy · h:mm a")}` : " just now"}.
            Now someone has a party to plan 🥳
          </p>
          <Button
            onClick={() => setCelebrateOpen(false)}
            className="bg-gradient-to-r from-amber-400 to-rose-400 font-bold text-[#18132B]"
            data-testid="claim-celebration-close"
          >
            Let the countdown begin 🥳
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
