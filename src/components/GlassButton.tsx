import type { ButtonHTMLAttributes } from 'react'

// Frosted card surface from Figma (Rectangle 1/2): shared by format cards and the Download all bar.
export const glassSurface =
  'rounded-(--radius-card) border border-card-border bg-card-fill shadow-[inset_0_-8px_22px_0_rgb(255_245_214/0.5)] backdrop-blur-[5.2px]'

export default function GlassButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${glassSurface} cursor-pointer transition-transform duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-60 ${className}`}
      {...props}
    />
  )
}
