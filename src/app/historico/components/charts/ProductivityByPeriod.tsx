import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Coffee, Moon, Sunrise } from 'lucide-react';
import { type StudyLog } from '@/types/types';
import { useMemo } from 'react';

const formatTime = (minutes: number) => {
  if (minutes === 0) return '0min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

interface ProductivityByPeriodProps {
  logs: StudyLog[];
}

export function ProductivityByPeriod({ logs }: ProductivityByPeriodProps) {
  const { periods, bestPeriod } = useMemo(() => {
    const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    logs.forEach(log => {
      const startTime = new Date(log.start_time);
      const hour = startTime.getHours();
      if (hour >= 6 && hour < 12) buckets.morning += log.duration;
      else if (hour >= 12 && hour < 18) buckets.afternoon += log.duration;
      else if (hour >= 18 && hour < 22) buckets.evening += log.duration;
      else buckets.night += log.duration;
    });

    const totalMinutes = Object.values(buckets).reduce((a, b) => a + b, 0);

    const periodsData = [
      { label: 'Manhã', sublabel: '6h – 12h', minutes: buckets.morning, icon: Sunrise, color: 'from-amber-400 to-yellow-300' },
      { label: 'Tarde', sublabel: '12h – 18h', minutes: buckets.afternoon, icon: Sun, color: 'from-orange-400 to-amber-300' },
      { label: 'Noite', sublabel: '18h – 22h', minutes: buckets.evening, icon: Moon, color: 'from-indigo-400 to-violet-300' },
      { label: 'Madrugada', sublabel: '22h – 6h', minutes: buckets.night, icon: Coffee, color: 'from-slate-500 to-slate-400' },
    ].map(p => ({
      ...p,
      percentage: totalMinutes > 0 ? (p.minutes / totalMinutes) * 100 : 0,
    }));

    const best = periodsData.reduce((b, p) => (p.minutes > b.minutes ? p : b), periodsData[0]);

    return { periods: periodsData, bestPeriod: best };
  }, [logs]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Produtividade por Período</CardTitle>
        <CardDescription>
          {bestPeriod.minutes > 0
            ? `Você estuda mais pela ${bestPeriod.label.toLowerCase()}`
            : 'Registre sessões para ver tendências'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {periods.map((period) => {
            const Icon = period.icon;
            return (
              <div key={period.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{period.label}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {period.sublabel}
                    </span>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatTime(period.minutes)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${period.color} transition-all duration-500`}
                    style={{ width: `${Math.max(period.percentage, period.minutes > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
