export function PageGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden"
    >
      <div className="absolute -top-[200px] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#4F8EF7]/[0.12] blur-[120px]" />
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="mx-auto max-w-[1200px] px-6">
      <div className="h-px bg-gradient-to-r from-transparent via-[#DCE6F5] to-transparent" />
    </div>
  );
}
