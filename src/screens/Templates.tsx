import PlusGrid from '../components/PlusGrid'
import TemplateView from '../components/TemplateView'
import BufferButton from '../components/BufferButton'
import backIcon from '../assets/back.svg'
import { emptyPhoto } from '../lib/photos'
import { STORY_TEMPLATES, TEMPLATE_BY_ID, type CatalogTemplate } from '../lib/templates'

type Props = {
  onBack: () => void
  onSelect: (template: CatalogTemplate) => void
}


// Template repository for Stories. Each card shows a live preview of the layout.
export default function Templates({ onBack, onSelect }: Props) {
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

      <ul className="relative grid grid-cols-2 gap-x-4 gap-y-6 px-4 pt-4 pb-[calc(max(env(safe-area-inset-bottom),34px)+24px)]">
        {STORY_TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              className="flex w-full cursor-pointer flex-col gap-2.5 text-left transition-transform duration-150 active:scale-[0.97]"
            >
              <span className="block w-full overflow-hidden rounded-[10px]">
                <TemplateView template={TEMPLATE_BY_ID[t.templateId]} photo={emptyPhoto(t.templateId)} label="" />
              </span>
              <span className="px-0.5 text-lg leading-none text-cream">{t.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
