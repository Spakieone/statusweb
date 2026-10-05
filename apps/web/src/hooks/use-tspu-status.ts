import { useNetworkServerSummary, useNetworkTargets } from '@/hooks/use-network-api'

// Hardcoded probe-point agents used as RU/EU vantage points for TSPU (DPI
// blocking) detection. There is no DB field yet marking which servers act as
// probe points (see tspu-add-node.sh) — this mirrors that script's constants.
const RU_AGENT_ID = '1953d108-796f-40c3-98d6-aebc1f83c856'
const EU_AGENT_ID = '35056fb5-fad3-4f96-96aa-267abdccd1e1'

export type TspuStatus = 'blocked' | 'ok' | 'unavailable' | 'unknown'

function isTargetAvailable(
  targets: { availability: number; target_id: string }[] | undefined,
  targetIdsForIp: Set<string>
) {
  const matches = targets?.filter((t) => targetIdsForIp.has(t.target_id)) ?? []
  if (matches.length === 0) {
    return null
  }
  return matches.every((t) => t.availability > 0)
}

// Compares the same node's reachability as seen from the RU vantage point vs
// the EU (Vienna) vantage point. Matches by IP (via the target's "ip:port"
// field), not by server name — tspu-add-node.sh bakes the node's name into
// the target name at creation time, and names get renamed in the UI, but a
// server's IP is stable, so matching on it survives renames.
export function useTspuStatus(serverIp: string | null): TspuStatus {
  const { data: allTargets } = useNetworkTargets()
  const { data: ruSummary } = useNetworkServerSummary(RU_AGENT_ID)
  const { data: euSummary } = useNetworkServerSummary(EU_AGENT_ID)

  const targetIdsForIp = new Set(
    (allTargets ?? [])
      .filter((t) => serverIp && t.target.startsWith(`${serverIp}:`))
      .map((t) => t.id)
  )

  if (targetIdsForIp.size === 0) {
    return 'unknown'
  }

  const ruOk = isTargetAvailable(ruSummary?.targets, targetIdsForIp)
  const euOk = isTargetAvailable(euSummary?.targets, targetIdsForIp)

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
