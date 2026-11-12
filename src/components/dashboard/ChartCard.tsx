import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card } from "../ui/Primitives";
import { chartData } from "../../data/mocks";

export function ChartCard({
  title = "Évolution sur 6 mois",
  care = false,
}: {
  title?: string;
  care?: boolean;
}) {
  const color = care ? "#7c6fdb" : "#0f766e";
  const gradientId = care ? "careGrad" : "scoreGrad";
  return (
    <Card className="min-h-[330px]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold">{title}</h2>
          <p className="mt-1 text-[10px] text-slate-400">Données mises à jour aujourd’hui</p>
        </div>
        <Badge tone="slate">6 mois</Badge>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey={care ? "care" : "score"}
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
