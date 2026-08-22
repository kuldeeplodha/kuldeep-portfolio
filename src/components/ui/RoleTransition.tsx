import { m } from 'framer-motion'
import { useRole } from '../../hooks/useRole'

interface RoleTransitionProps {
  children: React.ReactNode
  className?: string
}

export function RoleTransition({ children, className }: RoleTransitionProps) {
  const { roleId, isTransitioning } = useRole()

  return (
    <m.div
      key={roleId}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isTransitioning ? 0.5 : 1,
        y: 0,
      }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </m.div>
  )
}
