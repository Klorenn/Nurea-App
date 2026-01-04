"use client"

export function FonasaLogo({ className = "h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 45"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for text */}
        <linearGradient id="fonasaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
      </defs>
      
      {/* Blue figure (left) - larger figure embracing smaller one */}
      <g>
        {/* Larger figure */}
        <path
          d="M8 8 C8 4, 10 2, 14 2 C18 2, 20 4, 20 8 C20 12, 18 16, 16 18 C14 20, 12 20, 10 18 C8 16, 8 12, 8 8 Z"
          fill="#1976D2"
        />
        {/* Smaller figure being embraced */}
        <circle cx="14" cy="16" r="3" fill="#64B5F6" />
        <path
          d="M11 19 Q11 21, 13 21 Q14 21.5, 15 21 Q16 21, 17 19"
          fill="#64B5F6"
        />
      </g>
      
      {/* Green figure (right) - larger circle embracing smaller circle */}
      <g>
        {/* Larger circle */}
        <circle cx="32" cy="10" r="6" fill="#66BB6A" />
        {/* Smaller circle being embraced */}
        <circle cx="32" cy="18" r="3" fill="#81C784" />
      </g>
      
      {/* Text "Fonasa" */}
      <text
        x="2"
        y="35"
        fontSize="14"
        fontWeight="600"
        fill="#1976D2"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.3"
      >
        Fonasa
      </text>
      
      {/* Color band: blue, white, red */}
      <g>
        {/* Blue section */}
        <rect x="2" y="37" width="15" height="3" fill="#1976D2" rx="1" />
        {/* White section */}
        <rect x="17" y="37" width="8" height="3" fill="#FFFFFF" rx="1" />
        {/* Red section */}
        <rect x="25" y="37" width="8" height="3" fill="#E53935" rx="1" />
      </g>
    </svg>
  )
}

