import type { SVGProps } from "react";

export function CuraFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={props.width || "1.5rem"}
      height={props.height || "1.5rem"}
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="currentColor"
        d="M176 100h-32v32a16 16 0 0 1-32 0v-4a4 4 0 0 0-8 0v4a24 24 0 0 0 48 0v-28h32a12 12 0 0 0 0-24h-36a12 12 0 0 0-12 12v16h-32a12 12 0 0 0 0 24h32v32a12 12 0 0 0 24 0v-32h32a12 12 0 0 0 0-24Z"
        transform="rotate(-45 128 128)"
      />
    </svg>
  );
}
