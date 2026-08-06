import type { DetailedHTMLProps, HTMLAttributes } from "react"

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "lord-icon": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
          src?: string
          trigger?: string
          colors?: string
          stroke?: string
          speed?: number | string
          state?: string
          target?: string
          loading?: string
        }
      }
    }
  }
}

export {}
