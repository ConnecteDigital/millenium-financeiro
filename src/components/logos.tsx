// Connect Digital Logo - fiel à identidade visual
export function ConnectDigitalLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="60" fill="#f97316"/>
      {/* Outer arc */}
      <path d="M95 60 C95 78.78 79.78 94 61 94 C42.22 94 27 78.78 27 60 C27 41.22 42.22 26 61 26"
        stroke="white" strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Middle arc */}
      <path d="M85 60 C85 73.26 74.26 84 61 84 C47.74 84 37 73.26 37 60 C37 46.74 47.74 36 61 36"
        stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" strokeOpacity="0.6"/>
      {/* Inner arc */}
      <path d="M75 60 C75 67.73 68.73 74 61 74 C53.27 74 47 67.73 47 60 C47 52.27 53.27 46 61 46"
        stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" strokeOpacity="0.35"/>
    </svg>
  )
}

// Millenium Logo - fiel à identidade visual
export function MilleniumLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="120" height="120" rx="18" fill="#1d4ed8"/>
      {/* Pipe body */}
      <rect x="18" y="38" width="84" height="18" rx="9" fill="#3b82f6"/>
      {/* Pipe horizontal */}
      <rect x="18" y="64" width="84" height="18" rx="9" fill="#3b82f6"/>
      {/* Pipe vertical connector */}
      <rect x="51" y="38" width="18" height="44" rx="5" fill="#2563eb"/>
      {/* Faucet top */}
      <rect x="51" y="18" width="18" height="24" rx="5" fill="#60a5fa"/>
      <rect x="44" y="16" width="32" height="10" rx="5" fill="#60a5fa"/>
      {/* Orange wrench 1 */}
      <rect x="24" y="52" width="44" height="14" rx="7" fill="#f97316" transform="rotate(-45 46 59)"/>
      <circle cx="32" cy="52" r="8" fill="#f97316"/>
      <circle cx="32" cy="52" r="4" fill="#1d4ed8"/>
      <circle cx="62" cy="67" r="8" fill="#f97316"/>
      <circle cx="62" cy="67" r="4" fill="#1d4ed8"/>
      {/* Orange wrench 2 */}
      <rect x="52" y="52" width="44" height="14" rx="7" fill="#fb923c" transform="rotate(45 74 59)"/>
      <circle cx="88" cy="52" r="8" fill="#fb923c"/>
      <circle cx="88" cy="52" r="4" fill="#1d4ed8"/>
      <circle cx="58" cy="67" r="8" fill="#fb923c"/>
      <circle cx="58" cy="67" r="4" fill="#1d4ed8"/>
    </svg>
  )
}

// Compact version for sidebar
export function MilleniumLogoCompact({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="36" height="36" rx="8" fill="#f97316"/>
      <text x="18" y="26" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="-apple-system,system-ui,sans-serif">M</text>
    </svg>
  )
}
