export default function SkillSightLogo({ className = "h-11 w-11" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skillsight-bg" x1="10" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F2A3D" />
          <stop offset="1" stopColor="#08111F" />
        </linearGradient>
        <linearGradient id="skillsight-stroke" x1="16" y1="18" x2="48" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="skillsight-iris" x1="23" y1="24" x2="39" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#skillsight-bg)" />
      <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="17.25" stroke="rgba(103,232,249,0.22)" />

      <path
        d="M14 32C18.6 23.6 25 19.5 32 19.5C39 19.5 45.4 23.6 50 32C45.4 40.4 39 44.5 32 44.5C25 44.5 18.6 40.4 14 32Z"
        stroke="url(#skillsight-stroke)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="8" fill="url(#skillsight-iris)" />
      <circle cx="32" cy="32" r="3.2" fill="#07111F" />

      <path
        d="M42.5 18.5V27.5"
        stroke="#99F6E4"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M47.5 15.5V27.5"
        stroke="#5EEAD4"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M52.5 12.5V27.5"
        stroke="#22D3EE"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
