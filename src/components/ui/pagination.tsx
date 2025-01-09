import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center py-4", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-2", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> & React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      "min-w-9 h-9 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
      isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

interface NavigationButtonProps extends React.ComponentProps<"a"> {
  disabled?: boolean
}

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: NavigationButtonProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn(
      "gap-1 pl-2.5 pr-3 transition-all duration-200",
      disabled && "cursor-not-allowed opacity-50",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      className
    )}
    {...props}
    onClick={disabled ? undefined : props.onClick}
    style={{ pointerEvents: disabled ? "none" : "auto" }}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  disabled,
  ...props
}: NavigationButtonProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn(
      "gap-1 pl-3 pr-2.5 transition-all duration-200",
      disabled && "cursor-not-allowed opacity-50",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      className
    )}
    {...props}
    onClick={disabled ? undefined : props.onClick}
    style={{ pointerEvents: disabled ? "none" : "auto" }}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center text-gray-400 dark:text-gray-600",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}