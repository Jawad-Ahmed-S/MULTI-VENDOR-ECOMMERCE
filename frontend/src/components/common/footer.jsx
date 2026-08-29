export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-10 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-display font-semibold text-background text-lg tracking-tight">ecom</span>
        </div>
        <p className="text-background/60 text-xs max-w-sm">
          A marketplace connecting independent sellers with buyers who care about what they buy.
        </p>
        <p className="text-background/40 text-[11px] mt-1">
          © {new Date().getFullYear()} ecom. All rights reserved.
        </p>
      </div>
    </footer>
  );
}