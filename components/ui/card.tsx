import React from "react";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-lg border shadow-md overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };