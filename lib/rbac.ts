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

export function getUserDisplay(user: User | null): UserDisplay {
  if (!user) {
    return { name: "Guest", subtitle: "General Services Unit" }
  }

  switch (user.role) {
    case "GSU_STAFF": {
      const p = user.gsu_head
      return {
        name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || roleLabel("GSU_STAFF"),
        subtitle: "General Services Unit",
      }
    }
    case "UNIT_HEAD": {
      const p = user.unit_head
      return {
        name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || roleLabel("UNIT_HEAD"),
        subtitle: `Unit Head · ${p?.unit?.unit_acronym || "Unit"}`,
      }
    }
    case "UNIT_STAFF": {
      const unit = user.unit
      return {
        name: unit?.unit_acronym ? `${unit.unit_acronym} Staff` : roleLabel("UNIT_STAFF"),
        subtitle: unit?.unit_name || "General Services Unit",
      }
    }
  }
}

export function getFirstName(user: User | null): string {
  if (!user) return "there"
  if (user.role === "GSU_STAFF") return user.gsu_head?.first_name || "GSU Staff"
  if (user.role === "UNIT_HEAD") return user.unit_head?.first_name || "Unit Head"
  if (user.role === "UNIT_STAFF") {
    const unit = user.unit
    return unit?.unit_acronym ? `${unit.unit_acronym} Staff` : "there"
  }
  return "there"
}
