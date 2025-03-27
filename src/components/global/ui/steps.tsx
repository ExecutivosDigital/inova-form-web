import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stepVariants = cva(
  " flex   break-words [&_[step-box]]:font-bold transition-colors duration-300 [&_[step-box=disable]]:text-white [&_[step-box=completed]]:text-white [&_[step-box=current]]:text-white [&_[step-box=current]]:bg-primary  ",
  {
    variants: {
      variant: {
        default:
          "[&_[step-bar-bg=disable]]:before:bg-zinc-300  transition-colors duration-300 [&_[step-bar-bg=current]]:before:bg-zinc-300 [&_[step-bar-bg=completed]]:before:bg-primary [&_[step-box=current]]:border-2 [&_[step-box=current]]:border-primary [&_[step-box=completed]]:bg-primary   [&_[step-box=disable]]:bg-zinc-300/90 [&_[step-box=error]]:bg-destructive [&_[step-box=error]]:text-destructive-foreground  ",
      },
      size: {
        sm: "[&_[step-box]]:h-5 [&_[step-box]]:w-5 [&_[step-box]]:text-[10px]",
        md: "[&_[step-box]]:h-8 [&_[step-box]]:w-8 [&_[step-box]]:text-xs",
        lg: "[&_[step-box]]:h-9 [&_[step-box]]:w-9 [&_[step-box]]:text-sm ",
        xl: "[&_[step-box]]:h-10 [&_[step-box]]:w-10 [&_[step-box]]:text-base",
      },
      content: {
        right: "flex-row",
        bottom: "flex-col",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
      content: "bottom",
    },
  },
);
const stepperVariants = cva("flex ", {
  variants: {
    direction: {
      horizontal: "flex-row items-center",
      vertical: "flex-col ltr:items-baseline",
    },
  },

  defaultVariants: {
    direction: "horizontal",
  },
});

interface StepperProps
  extends React.HTMLAttributes<HTMLOListElement>,
    VariantProps<typeof stepVariants> {
  children?: React.ReactNode;
  activestep?: number;
  disabled?: boolean;
  direction: "horizontal" | "vertical";
  current?: number;
  content?: "bottom" | "right";
  icon?: boolean;
  alternativeLabel?: boolean;
  gap?: boolean;
  status?: "error" | "warning" | "success" | "info";
}
interface StepProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof stepVariants> {
  children?: React.ReactNode;
  isLast?: boolean;
  count?: number;
  disabled?: boolean;
  current?: number;
  index?: number;
  icon?: boolean | React.ReactNode;
  gap?: boolean;
  direction?: "horizontal" | "vertical";
  alternativeLabel?: boolean;
  isBeforeLast?: boolean;
  status?: "error" | "warning" | "success" | "info";
  content?: "bottom" | "right";
}
const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      className,
      children,
      direction,
      disabled,
      variant,
      size,
      current,
      content,

      alternativeLabel,
      gap,
      status,
      ...props
    },
    ref,
  ) => {
    const childItem = React.Children.toArray(children);
    return (
      <ol
        ref={ref}
        className={cn(stepperVariants({ direction }), className, {
          "gap-2": gap,
          "text-center": alternativeLabel,
          "gap-3": content === "right",
        })}
        {...props}
      >
        {childItem.map((child, index) => {
          const isLast = index === childItem.length - 1;
          const isBeforeLast = index === childItem.length - 2;
          const count = index + 1;
          const stepChild = child as React.ReactElement<StepProps>;
          const { ...childProps } = stepChild.props;
          return React.cloneElement(stepChild, {
            ...childProps, // Spread only the child's own props
            isLast,
            disabled: disabled && !isLast,
            count,
            index,
            current,
            gap,
            direction,
            alternativeLabel,
            isBeforeLast,
            content,
            status,
            size,
            className: cn(stepVariants({ variant, size, content })),
          });
        })}
      </ol>
    );
  },
);
Stepper.displayName = "Stepper";

const Step = React.forwardRef<HTMLLIElement, StepProps>(
  (
    {
      className,
      children,
      variant,
      size,
      isLast,
      count,
      current,
      content,
      index,
      icon,
      gap,
      direction,
      alternativeLabel,
      isBeforeLast,
      status,
      ...props
    },
    ref,
  ) => {
    const getStepBarBg = (current: number, index: number) => {
      if (current > index) return "completed";
      if (current < index) return "disable";
      if (current === index) return "current";
      return "";
    };

    const stepBarBg = getStepBarBg(current ?? 0, index ?? 0);

    const getStepBox = (
      current: number,
      index: number,
      status: "error" | "warning" | "success" | "info" | undefined,
    ) => {
      if (status === "error" && current === index) {
        return "error";
      }
      if (current > index) return "completed";
      if (current < index) return "disable";
      if (current === index) return "current";
      return "";
    };

    const stepBox = getStepBox(current ?? 0, index ?? 0, status);
    // Check if content is 'right'
    const isContentRight = content === "right";
    // Check if any of the specific props are present
    const hasSpecificProps =
      gap !== undefined ||
      alternativeLabel !== undefined ||
      direction !== undefined;
    // has render
    const renderChildren =
      !isContentRight || (isContentRight && !hasSpecificProps);
    return (
      <li
        ref={ref}
        className={cn(stepVariants({ variant, size, content }), className, {
          "min-h-[80px] flex-row gap-x-4": direction === "vertical",
          "flex-1": !isLast,
          "last:flex-1": alternativeLabel && isLast,
          "last:flex-none": alternativeLabel && isLast && gap,
        })}
        {...props}
      >
        <div
          step-bar-bg={stepBarBg}
          className={cn("relative z-[1] flex flex-row items-center", {
            "flex-col": direction === "vertical",

            "before:absolute before:top-1/2 before:z-[-1] before:w-full before:-translate-y-1/2":
              !isLast && direction !== "vertical",
            "before:w-[calc(100%-44px)] ltr:before:left-[44px] rtl:before:right-[44px]":
              gap && !alternativeLabel,
            "ltr:before:left-1/2 rtl:before:right-1/2":
              alternativeLabel && !gap,
            "before:w-[calc(100%-60px)] ltr:before:left-[calc(50%+33px)] rtl:before:right-[calc(50%+33px)]":
              alternativeLabel && gap,
            "before:w-[calc(100%-85px)]":
              alternativeLabel && gap && isBeforeLast,
            "flex-1 before:h-0.5": isContentRight,
            "before:h-1": !isContentRight,
          })}
        >
          <span
            className={cn(
              "relative z-20 inline-flex flex-none items-center justify-center rounded-full leading-none",
              {
                "mx-auto": alternativeLabel,
                "[&>svg]:h-5 [&>svg]:w-5": size !== "sm",
                "[&>svg]:h-3 [&>svg]:w-3": size === "sm",
              },
            )}
            step-box={stepBox}
          >
            {stepBarBg === "completed" ? <Check /> : icon || count}
          </span>
          {isContentRight && renderChildren && (
            <div className="bg-card px-3">{children}</div>
          )}

          {!isLast && direction === "vertical" && (
            <div
              className={cn(
                "relative h-full w-1 grow before:absolute before:h-full before:w-full",
                {
                  "before:top-[10px] before:h-[calc(100%-10px)]": gap,
                },
              )}
              step-bar-bg={stepBarBg}
            />
          )}
        </div>
        {!isContentRight && renderChildren && <div>{children}</div>}
      </li>
    );
  },
);
Step.displayName = "Step";

interface CommonProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
}
const StepLabel = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-default-600 mt-2 text-sm font-medium",
          {
            "text-destructive": error,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepLabel.displayName = "StepLabel";

const StepDescription = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-muted-foreground text-sm",
          {
            "text-destructive": error,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
StepDescription.displayName = "StepDescription";

export { Stepper, Step, StepLabel, StepDescription };
