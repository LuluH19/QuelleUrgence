import Link from 'next/link'

export default function EmergencyButton() {
  return (
    <Link
      href="tel:114"
      className="fixed bottom-24 md:bottom-6 right-6 bg-primary text-white font-bold p-2.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-110 z-[9999] flex items-center gap-2 border-[3px] border-black focus:outline-none focus:ring-4 focus:ring-red-600"
      aria-label="Appeler le numéro d'urgence 114"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={2} 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
        />
      </svg>
      <span className="hidden sm:inline">Appeler le 114</span>
      <span className="sm:hidden">114</span>
    </Link>
  )
}

