import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageSection({ title, description, children, className }) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function ResponsiveGrid({ children, className }) {
  let index = 0;
  return (
    <div className={cn("grid gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Children.map(children, (child) => isValidElement(child) ? cloneElement(child, { accentIndex: index++ }) : child)}
    </div>
  );
}

