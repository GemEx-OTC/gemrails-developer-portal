import Image from "next/image"

type LogoVariant = "small" | "large"

interface BrandLogoProps {
  variant?: LogoVariant
  size?: number
  className?: string
  priority?: boolean
}

const SOURCES: Record<LogoVariant, string> = {
  small: "/logo/gemrails-icon.png",
  large: "/logo/logo_icon.png",
}

export function BrandLogo({
  variant = "small",
  size = 36,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={SOURCES[variant]}
      alt="GemRails"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  )
}
