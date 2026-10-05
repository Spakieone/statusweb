interface TagChipsProps {
  tags: readonly string[] | undefined
}

// Fixed project/category tags get a distinct accent so they read at a glance among
// the free-form tags, which stay the default emerald. Two independent dimensions
// (project: PEPE/No-Touch, category: site/node/bot/remnawave-panel) can both be set
// on the same server, so each gets its own color so they don't visually collide.
//
// Tag VALUES stored on the server must be ASCII (server_tag::validate_tags only
// allows [a-zA-Z0-9_.-]), so the fixed category tags are ASCII slugs; only the
// on-screen LABEL is Russian, via CATEGORY_LABELS below.
const PROJECT_TAG_STYLES: Record<string, string> = {
  PEPE: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
  'No-Touch': 'border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300',
  site: 'border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  node: 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  bot: 'border-pink-500/30 bg-pink-500/5 text-pink-700 dark:text-pink-300',
  'remnawave-panel': 'border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-300'
}
const DEFAULT_TAG_STYLE = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'

export const CATEGORY_LABELS: Record<string, string> = {
  site: 'Сайт',
  node: 'Нода',
  bot: 'Бот',
  'remnawave-panel': 'Панель Remnawave'
}

export function TagChips({ tags }: TagChipsProps) {
  if (!tags || tags.length === 0) {
    return (
      <div aria-hidden="true" className="flex flex-wrap gap-1">
        <span className="invisible rounded-sm border px-1.5 py-0.5 text-[10px] leading-[1.2]">&nbsp;</span>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          className={`rounded-sm border px-1.5 py-0.5 text-[10px] leading-[1.2] ${PROJECT_TAG_STYLES[tag] ?? DEFAULT_TAG_STYLE}`}
          key={tag}
        >
          {CATEGORY_LABELS[tag] ?? tag}
        </span>
      ))}
    </div>
  )
}
