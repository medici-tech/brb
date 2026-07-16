import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  BookOpenText,
  CircleDollarSign,
  Gauge,
  Landmark,
  RadioTower,
  ShieldAlert,
} from "lucide-react";

import {
  ActionBar,
  AdvisorPanel,
  ArtworkPlaceholder,
  BriefingHeader,
  BriefingShell,
  ClassificationStamp,
  CommandSidebar,
  ConfirmActionDialog,
  DecisionOption,
  DossierCard,
  DossierPanel,
  EmptyState,
  FileIndexCard,
  LoadingState,
  MetricStrip,
  OutcomeNotice,
  ProgressTrack,
  RedactedText,
  SectionHeading,
  StatusBadge,
  ThreatPanel,
} from "@/components/brb/ui";
import type { BrbStat, BrbTone } from "@/components/brb/ui";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "BRB Design System",
  description: "Reusable interface components for the BRB political strategy simulator.",
};

const metrics: BrbStat[] = [
  { label: "Money", value: 72, maximum: 100, helper: "Liquid authority", trend: "+4", tone: "stable" },
  { label: "Influence", value: 48, maximum: 100, helper: "Favors available", trend: "-2", tone: "warning" },
  { label: "Intelligence", value: 64, maximum: 100, helper: "Verified sources", trend: "+7", tone: "informational" },
  { label: "Trust", value: 31, maximum: 100, helper: "Institutional confidence", trend: "-9", tone: "critical" },
  { label: "Capacity", value: 81, maximum: 100, helper: "Operational readiness", trend: "0", tone: "stable" },
];

const tones: BrbTone[] = ["neutral", "informational", "stable", "warning", "critical", "classified"];

function TokenCard({ name, value, className }: { name: string; value: string; className: string }) {
  return (
    <div className="overflow-hidden border border-border bg-console">
      <div className={`h-20 ${className}`} />
      <div className="p-3">
        <strong className="brb-telemetry block text-[10px] tracking-[0.1em] uppercase">{name}</strong>
        <span className="brb-telemetry mt-1 block text-[9px] text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function Foundations() {
  return (
    <div className="space-y-16">
      <section>
        <SectionHeading eyebrow="01 / Foundations" title="A briefing room, not a dashboard" description="Warm information, cold machinery, and one carefully rationed danger color. Red means the decision cannot be taken back." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <TokenCard name="Obsidian" value="#11130f" className="bg-background" />
          <TokenCard name="Console" value="#1b1e18" className="bg-console" />
          <TokenCard name="Raised" value="#24281f" className="bg-raised" />
          <TokenCard name="Dossier" value="#cfc09d" className="bg-dossier" />
          <TokenCard name="Signal" value="#d69a3a" className="bg-signal" />
          <TokenCard name="Critical" value="#a63a32" className="bg-destructive" />
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="02 / Typography" title="Government grotesk meets machine telemetry" />
        <div className="grid gap-px border border-border bg-border lg:grid-cols-3">
          <div className="bg-console p-6"><span className="brb-telemetry text-[9px] text-muted-foreground uppercase">Display / Barlow Condensed</span><p className="brb-display mt-5 mb-0 text-5xl leading-[0.88] font-semibold">THE STATE REMAINS OPERATIONAL</p></div>
          <div className="bg-console p-6"><span className="brb-telemetry text-[9px] text-muted-foreground uppercase">Body / IBM Plex Sans</span><p className="mt-5 mb-0 text-sm leading-7 text-muted-foreground">This room does not predict the future. It records what the administration is prepared to sacrifice in order to arrive there.</p></div>
          <div className="bg-console p-6"><span className="brb-telemetry text-[9px] text-muted-foreground uppercase">Telemetry / IBM Plex Mono</span><p className="brb-telemetry mt-5 mb-0 text-sm leading-7 text-phosphor">RUN BRB-1974-09<br />SIGNAL 81.2%<br />CLEARANCE EYES ONLY</p></div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="03 / Controls" title="Actions and status language" />
        <div className="grid gap-6 border border-border bg-console p-5 lg:grid-cols-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="command">Command</Button>
            <Button variant="quiet">Quiet</Button>
            <Button variant="critical">Critical</Button>
            <Button variant="secondary">Stable</Button>
            <Button variant="command" disabled>Unavailable</Button>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline" size="icon" aria-label="Open technical note"><BookOpenText aria-hidden="true" /></Button></TooltipTrigger>
              <TooltipContent>Technical note available</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tones.map((tone) => <StatusBadge key={tone} tone={tone}>{tone}</StatusBadge>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function MockBriefing() {
  return (
    <div className="space-y-8">
      <MetricStrip stats={metrics} />

      <DossierPanel
        eyebrow="Situation file 07 · Month 12"
        title="The Impossible Appropriation"
        summary="The committee will fund the machine, but only if the Directorate transfers oversight to a private authority before dawn."
        classification="Eyes only"
        footer={<span className="brb-telemetry text-[9px] tracking-[0.12em] uppercase opacity-65">Source confidence 72% · Delayed consequences remain classified</span>}
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <DecisionOption index="01" title="Accept the transfer" description="Secure immediate funding and surrender an unknown degree of control." metadata="Money +18 · Access risk detected" />
            <DecisionOption index="02" title="Force a public appropriation" description="Expose the project to legislative scrutiny and preserve formal authority." metadata="Trust +8 · Two-month delay" selected />
            <DecisionOption index="03" title="Close the file" description="Refuse the offer and recover capacity elsewhere." metadata="No immediate cost · Route may close" disabled />
          </div>
          <ArtworkPlaceholder icon={Landmark} aspect="portrait" label="Committee chamber placeholder" />
        </div>
      </DossierPanel>

      <OutcomeNotice eyebrow="Immediate consequence" title="The hearing has been scheduled." tone="warning" description="Public confidence improves, but every faction now knows the machine exists." details={<span>Delayed echo: <RedactedText blocks={2} /></span>} />

      <section>
        <SectionHeading eyebrow="Advisory channel" title="Consult before committing" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdvisorPanel name="Mara Voss" role="Director of Analysis" quote="The offer is real. The authority behind it may not be." stats={[{ label: "Alignment", value: 74 }, { label: "Leverage", value: 22 }]} action={{ label: "Consult analyst" }} />
          <AdvisorPanel name="Elias Reed" role="Political Fixer" status="Compromised" tone="warning" quote="Control is a story we tell after the money arrives." stats={[{ label: "Alignment", value: 46 }, { label: "Leverage", value: 68 }]} action={{ label: "Request intervention" }} />
          <AdvisorPanel name="June Hale" role="Institutional Steward" status="Withholding" tone="critical" quote="Do this in daylight, or do not ask me to defend it." stats={[{ label: "Alignment", value: 31 }, { label: "Leverage", value: 41 }]} action={{ label: "Consult steward", disabled: true }} />
        </div>
      </section>

      <ActionBar actions={[{ label: "Protect institutions" }, { label: "Recover capacity" }, { label: "Strengthen coalition" }]} />
    </div>
  );
}

function ComponentLibrary() {
  return (
    <div className="space-y-16">
      <section>
        <SectionHeading eyebrow="Dossier surfaces" title="Files carry warmth; systems carry pressure" />
        <div className="grid gap-5 lg:grid-cols-3">
          <DossierCard fileId="FCD-07-114" title="Silent Partner" summary="A recovered payment trail linking three public offices to an unnamed contractor." artwork={<ArtworkPlaceholder label="Payment ledger placeholder" />} footer={<ClassificationStamp tone="classified">Declassified</ClassificationStamp>} />
          <DossierCard fileId="FCD-10-882" title="Continuity Charter" summary="Emergency language prepared before the emergency existed." tone="critical" artwork={<ArtworkPlaceholder icon={ShieldAlert} label="Charter photograph placeholder" />} footer={<span className="brb-telemetry text-[9px] uppercase opacity-60">Chain evidence 01 / 02</span>} />
          <DossierCard fileId="FCD-12-003" title="The Empty Chair" summary="Attendance records were corrected after the meeting adjourned." tone="warning" artwork={<ArtworkPlaceholder icon={Gauge} label="Briefing room placeholder" />} />
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Feedback" title="Every non-happy path is designed" />
        <div className="grid gap-5 lg:grid-cols-2">
          <EmptyState title="No route intelligence recovered" description="Complete a campaign file before this channel can be reconstructed." action={{ label: "Return to briefing" }} />
          <LoadingState />
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Commitment safety" title="Irreversible actions announce themselves" />
        <div className="border border-border bg-console p-5">
          <ConfirmActionDialog
            trigger={<Button variant="critical">Authorize final activation</Button>}
            title="Activate the BRB?"
            description="This commits every prepared track and ends the current file. Readiness does not guarantee control."
            tone="critical"
            confirmAction={{ label: "Activate BRB" }}
          />
        </div>
      </section>
    </div>
  );
}

function ArchiveStates() {
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading eyebrow="Archive states" title="Knowledge persists; power does not" description="The same card supports discovered, classified, redacted, and unavailable states without receiving simulator types." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FileIndexCard fileId="FILE 01" state="discovered" title="The Missing Appropriation" metadata="3 encounters · 2 choices witnessed" />
          <FileIndexCard fileId="FILE 02" state="classified" />
          <FileIndexCard fileId="FILE 03" state="redacted" metadata="Partial chain evidence" />
          <FileIndexCard fileId="FILE 04" state="unavailable" metadata="Record destroyed" />
        </div>
      </section>
      <OutcomeNotice eyebrow="Archive protocol" title="What has been witnessed cannot be unwitnessed." tone="classified" description="Recovered files change the player’s knowledge, never their starting resources." />
    </div>
  );
}

function SidebarContents() {
  return (
    <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] pr-3">
      <div className="space-y-1">
        <ProgressTrack label="Engineering" value={38} maximum={50} description="Machine function" status="Nominal" tone="stable" actions={[{ label: "Standard deposit" }, { label: "Large deposit" }]} />
        <ProgressTrack label="Access" value={26} maximum={50} description="Activation authority" status="Exposed" tone="warning" actions={[{ label: "Standard deposit" }]} />
        <ProgressTrack label="Legitimacy" value={19} maximum={50} description="Institutional consent" status="At risk" tone="critical" actions={[{ label: "Standard deposit" }]} />
        <ProgressTrack label="Stability" value={43} maximum={50} description="State continuity" status="Ready" tone="stable" actions={[{ label: "Standard deposit" }]} />
      </div>
      <Separator className="my-6 bg-border" />
      <ThreatPanel progress={67} threatLevel="Severe" posture="Infiltrating" briefingItems={["Contractor access rose after the last deposit.", "One advisor channel may be compromised."]} />
    </ScrollArea>
  );
}

export default function DesignSystemPage() {
  return (
    <BriefingShell
      header={<BriefingHeader eyebrow="Federal Continuity Directorate · Interface Standard 01" title="BRB Design System" metadata="REV 1974-C" actions={[{ label: "Archive index", icon: Archive }, { label: "Signal test", icon: RadioTower }]} />}
      sidebar={<CommandSidebar title="Command panel" description="Responsive simulator controls"><SidebarContents /></CommandSidebar>}
    >
      <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div>
          <p className="brb-telemetry m-0 text-[10px] tracking-[0.2em] text-signal uppercase">Presentation layer / simulator independent</p>
          <h2 className="brb-display mt-4 mb-0 max-w-4xl text-6xl leading-[0.82] font-semibold tracking-[-0.025em] sm:text-7xl xl:text-8xl">The machine needs an interface worthy of the decision.</h2>
          <p className="mt-6 mb-0 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">A reusable React system for classified files, operational telemetry, advisors, irreversible choices, and the silence between them.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="command"><Link href="/"><ArrowLeft aria-hidden="true" />Return to prototype</Link></Button>
            <StatusBadge tone="stable">Static export ready</StatusBadge>
          </div>
        </div>
        <ArtworkPlaceholder icon={CircleDollarSign} aspect="square" label="Big Red Button schematic placeholder" />
      </section>

      <Tabs defaultValue="briefing" className="gap-8">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-sm border border-border bg-console p-1">
          <TabsTrigger value="briefing" className="min-h-11 rounded-sm px-4 font-mono text-[10px] tracking-[0.12em] uppercase data-[state=active]:bg-signal data-[state=active]:text-primary-foreground">Mock briefing</TabsTrigger>
          <TabsTrigger value="foundations" className="min-h-11 rounded-sm px-4 font-mono text-[10px] tracking-[0.12em] uppercase data-[state=active]:bg-signal data-[state=active]:text-primary-foreground">Foundations</TabsTrigger>
          <TabsTrigger value="components" className="min-h-11 rounded-sm px-4 font-mono text-[10px] tracking-[0.12em] uppercase data-[state=active]:bg-signal data-[state=active]:text-primary-foreground">Components</TabsTrigger>
          <TabsTrigger value="archive" className="min-h-11 rounded-sm px-4 font-mono text-[10px] tracking-[0.12em] uppercase data-[state=active]:bg-signal data-[state=active]:text-primary-foreground">Archive</TabsTrigger>
        </TabsList>
        <TabsContent value="briefing"><MockBriefing /></TabsContent>
        <TabsContent value="foundations"><Foundations /></TabsContent>
        <TabsContent value="components"><ComponentLibrary /></TabsContent>
        <TabsContent value="archive"><ArchiveStates /></TabsContent>
      </Tabs>
    </BriefingShell>
  );
}
