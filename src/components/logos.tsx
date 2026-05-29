// Logos das empresas
// Coloque os arquivos em /public/logo-millenium.png e /public/logo-connect.png
// O sistema usa SVG como fallback enquanto as imagens nao existem

export function ConnectDigitalLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="60" fill="#f97316"/>
      {/* Outer C arc */}
      <path d="M98 60 C98 80.43 81.43 97 61 97 C40.57 97 24 80.43 24 60 C24 39.57 40.57 23 61 23"
        stroke="white" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Middle arc */}
      <path d="M87 60 C87 74.36 75.36 86 61 86 C46.64 86 35 74.36 35 60 C35 45.64 46.64 34 61 34"
        stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
      {/* Inner arc */}
      <path d="M76 60 C76 68.28 69.28 75 61 75 C52.72 75 46 68.28 46 60 C46 51.72 52.72 45 61 45"
        stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" strokeOpacity="0.35"/>
    </svg>
  )
}

export function MilleniumLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  const s = size / 120
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Blue pipe - U shape */}
      <path d="M20 30 L20 75 Q20 90 35 90 L85 90 Q100 90 100 75 L100 30"
        stroke="#1d4ed8" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Pipe cap / faucet top */}
      <rect x="50" y="14" width="20" height="24" rx="5" fill="#2563eb"/>
      <rect x="40" y="12" width="40" height="12" rx="6" fill="#3b82f6"/>
      {/* Water drop */}
      <ellipse cx="60" cy="48" rx="4" ry="5" fill="#60a5fa"/>
      {/* Orange wrench 1 (diagonal /) */}
      <g transform="rotate(-40 60 60)">
        <rect x="36" y="55" width="48" height="10" rx="5" fill="#f97316"/>
        <circle cx="36" cy="60" r="9" fill="#f97316"/>
        <circle cx="36" cy="60" r="5" fill="#1d4ed8"/>
        <circle cx="84" cy="60" r="9" fill="#f97316"/>
        <circle cx="84" cy="60" r="5" fill="#1d4ed8"/>
      </g>
      {/* Orange wrench 2 (diagonal \) */}
      <g transform="rotate(40 60 60)">
        <rect x="36" y="55" width="48" height="10" rx="5" fill="#fb923c"/>
        <circle cx="36" cy="60" r="9" fill="#fb923c"/>
        <circle cx="36" cy="60" r="5" fill="#1d4ed8"/>
        <circle cx="84" cy="60" r="9" fill="#fb923c"/>
        <circle cx="84" cy="60" r="5" fill="#1d4ed8"/>
      </g>
    </svg>
  )
}

// Versao compacta para sidebar (so o M laranja)
export function MilleniumIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-orange-500 font-black text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
    >
      M
    </div>
  )
}
