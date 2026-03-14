"use client";

import { Check, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Tag } from "@/components/ui/Tag";
import { Input } from "@/components/ui/Input";
import { WorkoutCard } from "@/components/workout/WorkoutCard";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-semibold text-core-gray-400 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </section>
  );
}

export default function TestPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-[24px] font-bold text-core-primary mb-8">Component Kitchen Sink</h1>

      {/* ── Button ── */}
      <Section title="Button — filled">
        <Button variant="filled">Default</Button>
        <Button variant="filled" status="plain">Plain</Button>
        <Button variant="filled" status="error">Error</Button>
        <Button variant="filled" disabled>Disabled</Button>
        <Button variant="filled" icon={<Check className="size-4" />} iconPosition="left">
          With Icon
        </Button>
        <Button variant="filled" icon={<Check className="size-4" />} iconPosition="right">
          Icon Right
        </Button>
      </Section>

      <Section title="Button — outline">
        <Button variant="outline">Default</Button>
        <Button variant="outline" status="plain">Plain</Button>
        <Button variant="outline" status="error">Error</Button>
        <Button variant="outline" disabled>Disabled</Button>
      </Section>

      <Section title="Button — blank">
        <Button variant="blank">Default</Button>
        <Button variant="blank" status="plain">Plain</Button>
        <Button variant="blank" status="error">Error</Button>
        <Button variant="blank" disabled>Disabled</Button>
      </Section>

      {/* ── Chip ── */}
      <Section title="Chip">
        <Chip type="accent">Accent</Chip>
        <Chip type="plain">Plain</Chip>
        <Chip type="grey">Grey</Chip>
        <Chip type="error">Error</Chip>
      </Section>

      {/* ── Tag ── */}
      <Section title="Tag — sport types">
        <Tag type="SWIM">Swim</Tag>
        <Tag type="BIKE">Bike</Tag>
        <Tag type="RUN">Run</Tag>
        <Tag type="STRENGTH">Strength</Tag>
        <Tag type="BRICK">Brick</Tag>
        <Tag type="REST">Rest</Tag>
        <Tag type="OTHER">Other</Tag>
      </Section>

      <Section title="Tag — semantic">
        <Tag type="accent">Accent</Tag>
        <Tag type="plain">Plain</Tag>
        <Tag type="grey">Grey</Tag>
        <Tag type="error">Error</Tag>
      </Section>

      {/* ── Input ── */}
      <Section title="Input">
        <div className="w-56">
          <Input label="Default" placeholder="Enter text…" />
        </div>
        <div className="w-56">
          <Input label="With start icon" startIcon={<Search className="size-4" />} placeholder="Search…" />
        </div>
        <div className="w-56">
          <Input label="With end icon" endIcon={<Eye className="size-4" />} placeholder="Password" htmlType="password" />
        </div>
        <div className="w-56">
          <Input label="Error state" inputType="error" error="This field is required" placeholder="Enter text…" />
        </div>
        <div className="w-56">
          <Input label="Disabled" disabled placeholder="Can't touch this" />
        </div>
      </Section>

      {/* ── WorkoutCard ── */}
      <Section title="WorkoutCard — plan (full)">
        <WorkoutCard
          version="plan"
          size="full"
          type="RUN"
          title="Easy Run"
          goal="ENDURANCE"
          targetDuration={3600}
          targetDistance={10000}
          onComplete={() => alert("Complete!")}
          onSkip={() => alert("Skip!")}
        />
        <WorkoutCard
          version="plan"
          size="full"
          type="SWIM"
          title="Technique Work"
          goal="TECHNIQUE"
          targetDuration={2700}
          onComplete={() => {}}
          onSkip={() => {}}
        />
      </Section>

      <Section title="WorkoutCard — complete / skip">
        <WorkoutCard
          version="complete"
          size="full"
          type="BIKE"
          title="Tempo Ride"
          goal="TEMPO"
          targetDuration={5400}
          targetDistance={40000}
        />
        <WorkoutCard
          version="skip"
          size="full"
          type="RUN"
          title="Intervals"
          goal="INTERVALS"
          targetDuration={3600}
        />
      </Section>

      <Section title="WorkoutCard — upcoming (small)">
        <WorkoutCard version="plan" size="upcoming" type="STRENGTH" title="Strength" goal="FREE" targetDuration={3600} />
        <WorkoutCard version="plan" size="upcoming" type="REST" title="Rest Day" />
        <WorkoutCard version="plan" size="upcoming" type="BRICK" title="Brick Session" targetDuration={7200} targetDistance={60000} />
      </Section>
    </div>
  );
}
