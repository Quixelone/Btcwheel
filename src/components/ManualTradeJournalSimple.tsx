import { Card } from './ui/card';
import { Button } from './ui/button';

export function ManualTradeJournalSimple() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Trade Journal Manuale</h2>
        <p className="text-gray-400">
          Componente in costruzione - presto disponibile!
        </p>
        <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600">
          Coming Soon
        </Button>
      </Card>
    </div>
  );
}
