import ScrollPinnedDemo from "@/components/animations/ScrollPinnedDemo";

export const metadata = {
  title: "Scroll Pinning Demo - GSAP",
  description: "Test page demonstrating scroll-linked, pinned storytelling sections using GSAP ScrollTrigger.",
};

export default function TestPinningPage() {
  return (
    <div className="w-full">
      <ScrollPinnedDemo />
    </div>
  );
}
