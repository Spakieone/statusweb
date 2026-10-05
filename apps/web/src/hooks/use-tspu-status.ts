import { useNetworkServerSummary } from '@/hooks/use-network-api'

// Hardcoded probe-point agents used as RU/EU vantage points for TSPU (DPI
// blocking) detection. There is no DB field yet marking which servers act as
// probe points (see tspu-add-node.sh) — this mirrors that script's constants.
const RU_AGENT_ID = '1953d108-796f-40c3-98d6-aebc1f83c856'
const EU_AGENT_ID = '35056fb5-fad3-4f96-96aa-267abdccd1e1'

export type TspuStatus = 'blocked' | 'ok' | 'unavailable' | 'unknown'

function isTargetAvailable(targets: { availability: number; target_name: string }[] | undefined, serverName: string) {
  const matches = targets?.filter((t) => t.target_name.startsWith(`${serverName}-`)) ?? []
  if (matches.length === 0) {
    return null
  }
  return matches.every((t) => t.availability > 0)
}

// Compares the same node's reachability as seen from the RU vantage point vs
// the EU (Vienna) vantage point. Only servers that were registered via
// tspu-add-node.sh have matching probe targets; everything else resolves to
// 'unknown' and callers should fall back to the plain online/offline badge.
export function useTspuStatus(serverName: string): TspuStatus {
  const { data: ruSummary } = useNetworkServerSummary(RU_AGENT_ID)
  const { data: euSummary } = useNetworkServerSummary(EU_AGENT_ID)

  const ruOk = isTargetAvailable(ruSummary?.targets, serverName)
  const euOk = isTargetAvailable(euSummary?.targets, serverName)

  if (ruOk === null || euOk === null) {
    return 'unknown'
  }
  if (ruOk && euOk) {
    return 'ok'
  }
  if (!ruOk && euOk) {
    return 'blocked'
  }
  return 'unavailable'
}
