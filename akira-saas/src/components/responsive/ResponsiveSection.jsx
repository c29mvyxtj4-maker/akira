export default function ResponsiveSection({
  children,
  padding = 'lg',
  gap = 'lg',
  className = '',
  ...props
}) {
  const paddingMap = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const gapMap = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div
      className={`flex flex-col ${paddingMap[padding] || paddingMap.lg} ${gapMap[gap] || gapMap.lg} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
