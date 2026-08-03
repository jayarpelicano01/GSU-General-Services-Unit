import type { User } from "@/app/types"

export type Role = "GSU_STAFF" | "UNIT_HEAD" | "UNIT_STAFF"

export const ALL_ROLES: readonly Role[] = ["GSU_STAFF", "UNIT_HEAD", "UNIT_STAFF"]
export const GSU_ROLES: readonly Role[] = ["GSU_STAFF"]
export const UNIT_ROLES: readonly Role[] = ["UNIT_HEAD", "UNIT_STAFF"]

export function roleLabel(role: Role): string {
  switch (role) {
    case "GSU_STAFF":
      return "GSU Staff"
    case "UNIT_HEAD":
      return "Unit Head"
    case "UNIT_STAFF":
      return "Unit Staff"
  }
}

export interface UserDisplay {
  name: string
  subtitle: string
}

function fullName(user: User): string {
  const names = [user.first_name, user.middle_name, user.last_name, user.suffix].filter(
    (part): part is string => !!part && part.trim() !== ""
  )
  return names.join(" ") || roleLabel(user.role)
}

export function getUserDisplay(user: User | null): UserDisplay {
  if (!user) {
    return { name: "Guest", subtitle: "General Services Unit" }
  }

  switch (user.role) {
    case "GSU_STAFF":
      return { name: fullName(user), subtitle: "General Services Unit" }
    case "UNIT_HEAD":
      return {
        name: fullName(user),
        subtitle: `Unit Head · ${user.unit?.unit_acronym || "Unit"}`,
      }
    case "UNIT_STAFF":
      return {
        name: fullName(user),
        subtitle: user.unit?.unit_name || "General Services Unit",
      }
  }
}

export function getFirstName(user: User | null): string {
  if (!user) return "there"
  return user.first_name || roleLabel(user.role)
}
