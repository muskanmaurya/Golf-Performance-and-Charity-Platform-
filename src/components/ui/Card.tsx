interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export default function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border bg-[#0e1420] border-[#1e2a3a]
        ${glow ? 'shadow-lg shadow-sky-500/5 border-sky-500/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
