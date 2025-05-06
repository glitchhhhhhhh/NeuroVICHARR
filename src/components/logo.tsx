import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      {...props}
    >
      <circle cx="50" cy="50" r="45" className="text-primary" stroke="currentColor" />
      <path
        d="M30 50 Q35 30 50 35 Q65 40 70 50"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M30 50 Q35 70 50 65 Q65 60 70 50"
        stroke="hsl(var(--accent))"
        strokeWidth="6"
        fill="none"
      />
      <circle cx="30" cy="50" r="5" fill="hsl(var(--accent))" stroke="none" />
      <circle cx="70" cy="50" r="5" fill="hsl(var(--accent))" stroke="none" />
      <circle cx="50" cy="35" r="4" fill="hsl(var(--foreground))" stroke="none" />
      <circle cx="50" cy="65" r="4" fill="hsl(var(--foreground))" stroke="none" />
    </svg>
  );
}
