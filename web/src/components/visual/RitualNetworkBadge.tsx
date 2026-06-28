import type { NetworkStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

export function RitualNetworkBadge({ status }: { status: NetworkStatus }) {
  if (status === "connected")
    return (
      <Badge color="var(--color-aqua)" dot>
        Ritual Testnet
      </Badge>
    );
  if (status === "wrong-network")
    return (
      <Badge color="var(--color-thorn)" dot>
        Wrong network
      </Badge>
    );
  return (
    <Badge color="var(--color-mist)" dot={false}>
      Offline
    </Badge>
  );
}
