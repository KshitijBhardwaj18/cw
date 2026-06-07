"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeizenConfig } from "@heizen/shared";

interface Props {
  staticIp: string;
  routing: NonNullable<HeizenConfig["routing"]>;
}

/**
 * Lightsail's env page variant of the Endpoints card. Shows the box's
 * public static IP, the DNS A records the user needs to add, and a
 * copy-able SSH command for debugging.
 *
 * No "Verify DNS" button yet — dns.google client-side lookup is on the
 * follow-up plan once we see how often users get stuck on propagation.
 */
export function LightsailEndpointsCard({ staticIp, routing }: Props) {
  const entries = Object.entries(routing);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Server
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <code className="flex-1 font-mono text-sm">{staticIp}</code>
          <CopyButton value={staticIp} label="Copy IP" />
          <SshButton ip={staticIp} />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          SSH key is downloadable from the Lightsail console → Account →
          SSH keys. Default user is{" "}
          <code className="font-mono">ubuntu</code>.
        </p>
      </div>

      {entries.length > 0 && (
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            DNS Records to Add
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Point each hostname&apos;s A record at the static IP above.
            HTTPS is automatic — Caddy fetches a Let&apos;s Encrypt cert
            on the first request after DNS resolves.
          </p>
          <div className="mt-3 overflow-hidden rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-1.5 font-medium">Type</th>
                  <th className="px-3 py-1.5 font-medium">Name</th>
                  <th className="px-3 py-1.5 font-medium">Value</th>
                  <th className="px-3 py-1.5 font-medium">Service</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {entries.map(([service, entry]) => (
                  <tr key={service} className="border-t border-border">
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px]">
                        A
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{entry.domain}</td>
                    <td className="px-3 py-2">{staticIp}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {service}:{entry.containerPort}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {entries.map(([service, entry]) => (
              <a
                key={service}
                href={`https://${entry.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-info hover:bg-muted/50"
              >
                {entry.domain}
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-7 w-7"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={label}
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </Button>
  );
}

function SshButton({ ip }: { ip: string }) {
  const cmd = `ssh ubuntu@${ip}`;
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-7 w-7"
      onClick={async () => {
        await navigator.clipboard.writeText(cmd);
      }}
      aria-label="Copy SSH command"
    >
      <Terminal size={12} />
    </Button>
  );
}
