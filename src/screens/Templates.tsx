import PlusGrid from '../components/PlusGrid'
import TemplateView from '../components/TemplateView'
import BufferButton from '../components/BufferButton'
import backIcon from '../assets/back.svg'
import { emptyPhoto } from '../lib/photos'
import { STORY_TEMPLATES, TEMPLATES, type CatalogTemplate } from '../lib/templates'

type Props = {
  onBack: () => void
  onSelect: (template: CatalogTemplate) => void
}

const preview = emptyPhoto()

// Template repository for Stories. Each card shows a live preview of the layout.
export default function Templates({ onBack, onSelect }: Props) {
  const template = TEMPLATES.story

  return (
    <main className="relative min-h-dvh bg-black">
      <PlusGrid className="fixed" />

      <header className="sticky top-0 z-10 flex items-center justify-between rounded-b-[35px] bg-black px-[30px] pt-[calc(env(safe-area-inset-top)+26px)] pb-2.5">
        <button type="button" onClick={onBack} className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-[15px] p-2.5">
          <img src={backIcon} alt="" width={24} height={24} />
          <span className="text-xl leading-[0.85] text-cream">Templates</span>
        </button>
        <BufferButton className="-mr-2.5" />
      </header>

      <ul className="relative grid grid-cols-2 gap-x-6 gap-y-8 px-[30px] pt-4 pb-[calc(max(env(safe-area-inset-bottom),34px)+24px)]">
        {STORY_TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              className="flex w-full cursor-pointer flex-col gap-3 text-left transition-transform duration-150 active:scale-[0.97]"
            >
              <span className="relative block w-full overflow-hidden rounded-[18px] border border-card-border bg-card-fill p-4">
                {t.kind === 'batch' ? (
                  // Fanned stack of three stories = many photos at once.
                  <span className="relative block" style={{ aspectRatio: `${template.width} / ${template.height}` }}>
                    {[-8, 0, 8].map((deg, i) => (
                      <span
                        key={deg}
                        className="absolute inset-[6%] block shadow-[0_6px_20px_rgb(0_0_0/0.5)]"
                        style={{ transform: `rotate(${deg}deg) translateX(${(i - 1) * 6}%)`, zIndex: i === 1 ? 2 : 1 }}
                      >
                        <TemplateView template={template} photo={preview} label="" />
                      </span>
                    ))}
                  </span>
                ) : (
                  <TemplateView template={template} photo={preview} label="" />
                )}
              </span>
              <span className="flex flex-col gap-1.5 px-1">
                <span className="text-lg leading-none text-cream">{t.name}</span>
                <span className="text-xs leading-tight text-sand">{t.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
