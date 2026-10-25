import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Hero3DSection from "@/components/Hero3DSection";
import MemoryGallery from "@/components/MemoryGallery";
import VoiceNotes from "@/components/VoiceNotes";
import EnvelopeLetter from "@/components/EnvelopeLetter";
import RoadmapTimeline from "@/components/RoadmapTimeline";
import ClaimGiftContract from "@/components/ClaimGiftContract";
import VirtualHugsCounter from "@/components/VirtualHugsCounter";
import Footer from "@/components/Footer";
import FloatingMusicPlayer from "@/components/FloatingMusicPlayer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0B0C1E] text-slate-100">
      <Navbar />
      <main>
        <Hero3DSection />
        <MemoryGallery />
        <VoiceNotes />
        <EnvelopeLetter />
        <RoadmapTimeline />
        <ClaimGiftContract />
        <VirtualHugsCounter />
      </main>
      <Footer />
      <FloatingMusicPlayer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
