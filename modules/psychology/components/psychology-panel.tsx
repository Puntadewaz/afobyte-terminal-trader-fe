import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const preTradeChecks = [
  "I have clear invalidation and cut loss before entry.",
  "Position size follows risk rule, not emotional impulse.",
  "I am trading the plan, not revenge after a loss.",
  "I accept this trade can fail without changing identity.",
];

const commonBiases = [
  {
    title: "FOMO",
    note: "Entering late because price moved fast. Mitigation: wait for planned trigger only.",
  },
  {
    title: "Recency Bias",
    note: "Assuming last outcomes will repeat. Mitigation: evaluate setup quality, not recent PnL.",
  },
  {
    title: "Loss Aversion",
    note: "Holding losers too long. Mitigation: execute cut loss automatically at invalidation.",
  },
  {
    title: "Overconfidence",
    note: "Increasing size after a winning streak. Mitigation: keep risk per trade fixed.",
  },
];

const postTradePrompts = [
  "Did I follow my entry criteria exactly?",
  "Did I respect risk and exit plan?",
  "What emotion dominated this trade?",
  "What one improvement should I apply on the next setup?",
];

export function PsychologyPanel() {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-zinc-100">Trading Psychology</h2>
        <p className="text-sm text-zinc-400">
          Build consistent execution by managing emotion, bias, and decision quality.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Trade Mental Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            {preTradeChecks.map((item) => (
              <p key={item}>- {item}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Radar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-300">
            {commonBiases.map((bias) => (
              <div key={bias.title} className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <p className="font-medium text-zinc-100">{bias.title}</p>
                <p className="mt-1 text-zinc-400">{bias.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post-Trade Reflection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
          {postTradePrompts.map((prompt) => (
            <p key={prompt} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              {prompt}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
