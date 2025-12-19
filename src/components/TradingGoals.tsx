import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle2, Lock } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  status: 'locked' | 'active' | 'completed';
}

export function TradingGoals({ goals }: { goals: Goal[] }) {
  return (
    <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
      <h3 className="text-white font-bold text-sm mb-3">Trading Goals</h3>
      <div className="space-y-3">
        {goals.map((g) => (
          <div key={g.id} className={`p-3 rounded-lg border ${g.status === 'locked' ? 'opacity-60 border-white/10' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300">{g.title}</span>
              {g.status === 'completed' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : g.status === 'locked' ? (
                <Lock className="w-3 h-3 text-gray-500" />
              ) : null}
            </div>
            <Progress value={(g.current / g.target) * 100} className="h-1 bg-zinc-800" />
          </div>
        ))}
      </div>
    </Card>
  );
}
