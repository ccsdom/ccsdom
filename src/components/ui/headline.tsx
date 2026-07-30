
"use client";

import React, { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

const UnderlineSvg = ({ inView }: { inView: boolean }) => (
  <svg
    className={cn(
      "absolute bottom-0 left-0 w-full h-auto text-primary transition-all duration-1000 ease-out",
      inView ? "opacity-100" : "opacity-0"
    )}
    viewBox="0 0 206 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M1.5 8.9133C31.5 2.4133 118.9 -5.0867 204.5 8.9133"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className={cn("path-animation", inView && "animate")}
    />
  </svg>
);

export const Headline = ({
  children,
  className,
  as = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const headlineClassName = cn(
    "text-3xl font-headline font-bold tracking-tight sm:text-4xl",
    className
  );

  const processedChildren = Children.map(children, (child) => {
    if (typeof child === "string") {
      return child;
    }
    if (isValidElement(child) && child.type === "strong") {
      return cloneElement(child, {
        ...child.props,
        className: cn(child.props.className, "relative font-light"),
        children: (
          <>
            {child.props.children}
            <div className="absolute -bottom-2 left-0 w-full">
              <UnderlineSvg inView={inView} />
            </div>
          </>
        ),
      });
    }
    return child;
  });

  if (as === "h1") {
    return (
      <h1 ref={ref} className={headlineClassName}>
        {processedChildren}
      </h1>
    );
  }

  if (as === "h3") {
    return (
      <h3 ref={ref} className={headlineClassName}>
        {processedChildren}
      </h3>
    );
  }

  return (
    <h2 ref={ref} className={headlineClassName}>
      {processedChildren}
    </h2>
  );
};
