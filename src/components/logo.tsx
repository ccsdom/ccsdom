"use client";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  dark?: boolean;
  showSlogan?: boolean;
  iconClassName?: string;
  svgIconClassName?: string;
  titleClassName?: string;
  sloganClassName?: string;
  iconStrokeWidth?: number;
  iconWrapperClassName?: string;
};

export default function Logo({
  className,
  dark = false,
  showSlogan = true,
  iconClassName,
  svgIconClassName,
  titleClassName,
  sloganClassName,
  iconStrokeWidth = 4,
  iconWrapperClassName,
}: LogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] shadow-sm shadow-blue-950/15",
          iconWrapperClassName,
          iconClassName
        )}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className={cn("h-8 w-8 text-white", svgIconClassName)}
          fill="none"
        >
          <path
            d="M20 50V22C20 20.8954 20.8954 20 22 20H42C43.1046 20 44 20.8954 44 22V50"
            stroke="currentColor"
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 50V34C36 32.8954 35.1046 32 34 32H30C28.8954 32 28 32.8954 28 34V50"
            stroke="currentColor"
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 16L32 8L44 16"
            stroke="currentColor"
            strokeWidth={iconStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[
            [26, 28],
            [32, 28],
            [38, 28],
            [26, 42],
            [32, 42],
            [38, 42],
          ].map(([cx, cy]) => (
            <path
              key={`${cx}-${cy}`}
              d={`M${cx} ${cy}H${cx + 0.01}`}
              stroke="currentColor"
              strokeWidth={iconStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      <div className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate text-xl font-black tracking-[-0.03em] text-slate-950",
            dark && "text-white",
            titleClassName
          )}
        >
          CCS DOM
        </span>
        {showSlogan && (
          <span
            className={cn(
              "mt-1 truncate text-xs font-semibold text-slate-500",
              dark && "text-slate-300",
              sloganClassName
            )}
          >
            Domiciliation
          </span>
        )}
      </div>
    </div>
  );
}
