import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
  return (
    <div data-slot="page-header">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children && (
        <div className={cn("mt-4 flex gap-2")}>{children}</div>
      )}
    </div>
  )
}

export { PageHeader }
