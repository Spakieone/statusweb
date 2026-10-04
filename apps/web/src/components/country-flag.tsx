import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, countryCodeToName } from '@/lib/utils'

// Country flag with a hover tooltip showing the localized country name, so users
// don't have to recognize a flag or its 2-letter code on sight. Renders nothing when the
// code is missing or invalid.
//
// Uses flagcdn.com PNGs instead of Unicode regional-indicator emoji: those emoji don't
// render as flag glyphs on several common setups (missing emoji font / Windows+older
// Chromium combos), falling back to the raw two-letter code and looking broken.
//
// The flag itself stays decorative and unfocusable: it is redundant next to the server
// name and does not deserve a tab stop. The country name is exposed to assistive tech as
// sr-only text instead, which also folds it into the accessible name of the surrounding
// link when the flag sits inside one.
export function CountryFlag({ className, code }: { className?: string; code: string | null | undefined }) {
  const { i18n } = useTranslation()
  if (!code || code.length !== 2) {
    return null
  }
  const lower = code.toLowerCase()
  const name = countryCodeToName(code, i18n.language) || code.toUpperCase()
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <img
              alt=""
              aria-hidden="true"
              className={cn('inline-block h-[1em] w-[1.333em] shrink-0 rounded-[2px] object-cover align-middle', className)}
              height={12}
              loading="lazy"
              src={`https://flagcdn.com/24x18/${lower}.png`}
              srcSet={`https://flagcdn.com/48x36/${lower}.png 2x`}
              width={16}
            />
          }
        />
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
      <span className="sr-only">{name}</span>
    </>
  )
}
