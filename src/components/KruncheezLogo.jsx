// ── Kruncheez Logo Component ─────────────────────────────
// SVG logo matching the actual Kruncheez branding:
// Bull skull with horns + flame + western typography
// ─────────────────────────────────────────────────────────

export default function KruncheezLogo({ size = 'md', theme = 'dark' }) {
  const sizes = {
    xs:  { width: 80,  titleSize: 10, subSize: 5,  iconSize: 18 },
    sm:  { width: 120, titleSize: 14, subSize: 6,  iconSize: 26 },
    md:  { width: 180, titleSize: 20, subSize: 8,  iconSize: 36 },
    lg:  { width: 260, titleSize: 28, subSize: 11, iconSize: 52 },
    xl:  { width: 360, titleSize: 38, subSize: 14, iconSize: 70 },
  }
  const s = sizes[size] || sizes.md
  const textColor  = theme === 'dark' ? '#ffffff' : '#000000'
  const bgColor    = theme === 'dark' ? '#111111' : '#ffffff'
  const borderColor= '#e63946'

  return (
    <svg
      width={s.width}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="360" height="200" fill={bgColor} rx="8"/>

      {/* Red border top & bottom */}
      <rect width="360" height="12" fill={borderColor}/>
      <rect y="188" width="360" height="12" fill={borderColor}/>

      {/* "THE" text */}
      <text
        x="180" y="48"
        textAnchor="middle"
        fill={textColor}
        fontFamily="Georgia, serif"
        fontSize="18"
        fontWeight="400"
        letterSpacing="6"
      >• THE •</text>

      {/* "KRUNCHEEZ" main text */}
      <text
        x="180" y="90"
        textAnchor="middle"
        fill={borderColor}
        fontFamily="Impact, Arial Black, sans-serif"
        fontSize="52"
        fontWeight="900"
        letterSpacing="2"
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
      >KRUNCHEEZ</text>

      {/* Tagline */}
      <text
        x="180" y="112"
        textAnchor="middle"
        fill={textColor}
        fontFamily="Georgia, serif"
        fontSize="11"
        letterSpacing="3"
        fontStyle="italic"
      >FAST FOOD, CHINESE &amp; BBQ</text>

      {/* Left horn */}
      <path
        d="M 60 155 Q 30 130 20 110 Q 15 95 25 90 Q 35 88 45 100 Q 55 115 70 135 Z"
        fill={textColor}
        opacity="0.95"
      />
      {/* Left horn inner curve */}
      <path
        d="M 62 152 Q 35 132 26 112 Q 22 100 28 96"
        fill="none"
        stroke={bgColor}
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Right horn */}
      <path
        d="M 300 155 Q 330 130 340 110 Q 345 95 335 90 Q 325 88 315 100 Q 305 115 290 135 Z"
        fill={textColor}
        opacity="0.95"
      />
      {/* Right horn inner curve */}
      <path
        d="M 298 152 Q 325 132 334 112 Q 338 100 332 96"
        fill="none"
        stroke={bgColor}
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Bull skull */}
      {/* Main skull shape */}
      <ellipse cx="180" cy="162" rx="32" ry="22" fill={textColor} opacity="0.95"/>
      {/* Skull top dome */}
      <ellipse cx="180" cy="148" rx="24" ry="16" fill={textColor} opacity="0.95"/>
      {/* Left eye socket */}
      <ellipse cx="170" cy="155" rx="6" ry="7" fill={bgColor} opacity="0.85"/>
      {/* Right eye socket */}
      <ellipse cx="190" cy="155" rx="6" ry="7" fill={bgColor} opacity="0.85"/>
      {/* Nose holes */}
      <ellipse cx="176" cy="168" rx="3" ry="2.5" fill={bgColor} opacity="0.7"/>
      <ellipse cx="184" cy="168" rx="3" ry="2.5" fill={bgColor} opacity="0.7"/>
      {/* Teeth line */}
      <rect x="165" y="172" width="30" height="3" fill={bgColor} opacity="0.5" rx="1"/>
      {/* Skull crack */}
      <path d="M 180 140 L 178 150 L 182 155 L 179 162" stroke={bgColor} strokeWidth="1" fill="none" opacity="0.4"/>

      {/* Flame above skull */}
      {/* Outer flame */}
      <path
        d="M 180 118 C 172 125 168 130 170 138 C 172 145 180 146 180 146 C 180 146 188 145 190 138 C 192 130 188 125 180 118 Z"
        fill={borderColor}
        opacity="0.95"
      />
      {/* Inner flame */}
      <path
        d="M 180 124 C 175 129 174 133 176 138 C 177 141 180 142 180 142 C 180 142 183 141 184 138 C 186 133 185 129 180 124 Z"
        fill="#ff8c00"
        opacity="0.9"
      />
      {/* Flame tip glow */}
      <ellipse cx="180" cy="130" rx="3" ry="4" fill="#ffdd00" opacity="0.7"/>

      {/* Decorative lines beside tagline */}
      <line x1="30" y1="112" x2="95" y2="112" stroke={textColor} strokeWidth="1" opacity="0.5"/>
      <line x1="265" y1="112" x2="330" y2="112" stroke={textColor} strokeWidth="1" opacity="0.5"/>
    </svg>
  )
}
