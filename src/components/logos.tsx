import Image from 'next/image'

export function ConnectDigitalLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-connect.jpeg"
      alt="Connect Digital"
      width={size}
      height={size}
      className={`object-contain rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function MilleniumLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-millenium.png"
      alt="Millenium Desentupidora"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function MilleniumIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-millenium.png"
      alt="Millenium"
      width={size}
      height={size}
      className={`object-contain rounded-xl ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
