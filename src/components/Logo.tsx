export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-blue-600 text-white ${className ?? "h-9 w-9"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[55%] w-[55%]"
      >
        <path d="M14 3v5h5" />
        <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M9 17v-3" />
        <path d="M12 17v-5" />
        <path d="M15 17v-2" />
      </svg>
    </div>
  );
}
