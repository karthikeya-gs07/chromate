import instagramIcon from '../assets/instagram.svg'
import GlassButton from './GlassButton'

type Props = {
  label: string
  size: string
  // Height of the little phone/post preview box (Figma: story 64, post 45).
  previewHeight: number
  onSelect: () => void
}

export default function FormatCard({ label, size, previewHeight, onSelect }: Props) {
  return (
    <GlassButton
      onClick={onSelect}
      className="relative flex aspect-[178/262] flex-col justify-between px-[19px] pt-6 pb-9 text-left"
    >
      <span
        aria-hidden
        className="flex w-9 items-center justify-center rounded-md border border-cream/50 bg-cream/15"
        style={{ height: previewHeight }}
      >
        <img src={instagramIcon} alt="" width={19} height={19} />
      </span>
      <span className="flex flex-col gap-2">
        <span className="text-[26px] leading-none text-cream">{label}</span>
        <span className="text-sm leading-none text-sand">{size}</span>
      </span>
    </GlassButton>
  )
}
