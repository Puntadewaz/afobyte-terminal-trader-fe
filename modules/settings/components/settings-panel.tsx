import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-zinc-300">
        <p>Notification channels: in-app and Telegram status integration-ready.</p>
        <p>Regional settings: market timezone and accounting currency.</p>
        <p>Risk policy profiles: conservative, balanced, aggressive templates.</p>
      </CardContent>
    </Card>
  );
}
