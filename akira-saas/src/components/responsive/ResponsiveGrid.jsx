import clsx from 'clsx'

export default function ResponsiveGrid({ children, cols = 4, gap = 'gap-4', className }) {
  const gridClass = clsx(
    'grid',
    `grid-cols-1`,
    `md:grid-cols-2`,
    cols >= 4 ? `lg:grid-cols-3 xl:grid-cols-${cols}` : `lg:grid-cols-${cols}`,
    gap,
    className
  )

  return <div className={gridClass}>{children}</div>
}
