import clsx from 'clsx'

/**
 * ResponsiveImage - Optimized image component for different screen sizes
 * Automatically serves correct size based on viewport
 */
export default function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes,
  className = '',
  width,
  height,
  priority = false,
  loading = 'lazy',
  ...props
}) {
  // Default responsive sizes if not provided
  const defaultSrcSet =
    srcSet ||
    `${src}?w=320 320w, ${src}?w=640 640w, ${src}?w=1024 1024w, ${src}?w=1280 1280w`

  const defaultSizes =
    sizes ||
    '(max-width: 480px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'

  return (
    <img
      src={src}
      alt={alt}
      srcSet={defaultSrcSet}
      sizes={defaultSizes}
      loading={priority ? 'eager' : loading}
      className={clsx('max-w-full h-auto', className)}
      width={width}
      height={height}
      {...props}
    />
  )
}

/**
 * Picture element for more control over art direction
 * E.g., different images for mobile vs desktop
 */
export function ResponsivePicture({ sources, alt, className = '', ...props }) {
  return (
    <picture>
      {sources.map((source) => (
        <source
          key={source.media}
          media={source.media}
          srcSet={source.srcSet}
          sizes={source.sizes}
        />
      ))}
      <img alt={alt} className={clsx('max-w-full h-auto', className)} {...props} />
    </picture>
  )
}

/**
 * Aspect Ratio Box - maintain aspect ratio for responsive containers
 * Prevents layout shift when image loads
 */
export function AspectRatioBox({
  ratio = '16/9',
  children,
  className = '',
  ...props
}) {
  const [width, height] = ratio.split('/').map(Number)
  const paddingBottom = ((height / width) * 100).toFixed(2)

  return (
    <div
      className={clsx('relative w-full', className)}
      style={{ paddingBottom: `${paddingBottom}%` }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
