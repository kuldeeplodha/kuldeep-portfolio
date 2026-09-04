import type { ValidationIssue } from '../config/validationRegistry'
import { adminInputClass } from '../../components/admin/AdminLayout'

export function getFieldInputClass(
  issue?: ValidationIssue,
  baseClass: string = adminInputClass,
): string {
  if (issue?.severity === 'error') {
    return `${baseClass} !border-red-500 focus:!border-red-400 focus:!ring-red-400/30`
  }
  if (issue?.severity === 'warning') {
    return `${baseClass} !border-amber-500/80 focus:!border-amber-400 focus:!ring-amber-400/30`
  }
  return baseClass
}
