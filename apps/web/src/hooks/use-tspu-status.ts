import { useNetworkServerSummary, useNetworkTargets } from '@/hooks/use-network-api'
import { deriveServerStatus, type StatusKind } from '@/components/server/status-dot-utils'
import type { AgentAuthorityStateSummary } from '@/lib/api-schema'
import type { NetworkProbeTarget } from '@/lib/network-types'

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

// A server never reports ipv4 over REST until its own agent has connected at
// least once — but a server that's permanently TSPU-blocked may never get
// that far (that's the whole point: it can't reach the panel from RU). Fall
// back to matching the probe target's name against the server name (the
// convention tspu-add-node.sh uses: "<server-name>-<port>") so a blocked,
// never-connected server can still surface as 'blocked' instead of forever
// looking like an unrelated 'pending' ghost card.
function targetIdsByName(targets: NetworkProbeTarget[], serverName: string): Set<string> {
  return new Set(targets.filter((t) => t.name.startsWith(`${serverName}-`)).map((t) => t.id))
}

function targetIdsByIp(targets: NetworkProbeTarget[], serverIp: string): Set<string> {
  return new Set(targets.filter((t) => t.target.startsWith(`${serverIp}:`)).map((t) => t.id))
}

// Compares the same node's reachability as seen from the RU vantage point vs
// the EU (Vienna) vantage point. Prefers matching by IP (stable across
// renames), falling back to name-based matching for servers that have no
// ipv4 yet (see targetIdsByName above).
export function useTspuStatus(serverName: string, serverIp: string | null): TspuStatus {
  const { data: allTargets } = useNetworkTargets()
  const { data: ruSummary } = useNetworkServerSummary(RU_AGENT_ID)
  const { data: euSummary } = useNetworkServerSummary(EU_AGENT_ID)

  const targets = allTargets ?? []
  const targetIds = serverIp ? targetIdsByIp(targets, serverIp) : new Set<string>()
  if (targetIds.size === 0) {
    for (const id of targetIdsByName(targets, serverName)) {
      targetIds.add(id)
    }
  }

  if (targetIds.size === 0) {
    return 'unknown'
  }

  const ruOk = isTargetAvailable(ruSummary?.targets, targetIds)
  const euOk = isTargetAvailable(euSummary?.targets, targetIds)

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

// Shared by every place that renders a server's status dot/badge (server
// cards, the servers table's status column and name cell) so TSPU overrides
// offline/pending consistently everywhere instead of only on the dashboard
// cards.
export function useEffectiveServerStatus(server: {
  agent_authority?: AgentAuthorityStateSummary
  has_token?: boolean
  ipv4?: string | null
  name: string
  online: boolean
}): StatusKind | 'tspu' {
  const rawStatus = deriveServerStatus(server)
  const tspuStatus = useTspuStatus(server.name, server.ipv4 ?? null)
  return tspuStatus === 'blocked' ? 'tspu' : rawStatus
}
