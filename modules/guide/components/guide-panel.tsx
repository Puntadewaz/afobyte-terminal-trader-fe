import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const lessons = [
  {
    title: "Risk Management Basics",
    points: [
      "Risk per trade idealnya kecil dan konsisten, misalnya <= 1-2% modal.",
      "Selalu tentukan cut loss sebelum entry, bukan setelah posisi berjalan.",
      "Target profit harus punya rasio risk-reward yang masuk akal.",
    ],
  },
  {
    title: "Trend and Structure",
    points: [
      "Trading searah trend utama cenderung memberi probabilitas lebih baik.",
      "Perhatikan area support dan resistance untuk validasi entry.",
      "Gunakan konfirmasi struktur (breakout/pullback) agar entry lebih terukur.",
    ],
  },
  {
    title: "Trade Planning",
    points: [
      "Satu rencana trading minimal memuat: entry, stop loss, dan take profit.",
      "Tentukan skenario jika market bergerak melawan posisi.",
      "Jangan menambah posisi karena emosi; ikuti plan awal.",
    ],
  },
  {
    title: "Psychology and Discipline",
    points: [
      "Hindari revenge trade setelah loss beruntun.",
      "FOMO sering menyebabkan entry terlambat dengan risk tinggi.",
      "Konsistensi eksekusi lebih penting daripada satu trade besar.",
    ],
  },
];

export function GuidePanel() {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-zinc-100">Trading Guide</h2>
        <p className="text-sm text-zinc-400">
          Ringkasan materi dasar trading untuk membantu keputusan yang lebih disiplin.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {lessons.map((lesson) => (
          <Card key={lesson.title}>
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              {lesson.points.map((point) => (
                <p key={point}>- {point}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
