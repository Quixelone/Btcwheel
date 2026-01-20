import { storage } from './localStorage';

export function seedLocalDemoData() {
  const now = Date.now();

  const guestUser = {
    id: `guest-${now}`,
    email: 'guest@btcwheel.app',
    user_metadata: { name: 'Ospite' },
    app_metadata: { provider: 'local' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  storage.setItem('btcwheel_local_user', JSON.stringify(guestUser));

  storage.setItem(
    'btc-wheel-progress',
    JSON.stringify({
      level: 2,
      xp: 850,
      xpToNextLevel: 1000,
      streak: 3,
      badges: ['first-lesson'],
      lessonsCompleted: 2,
      totalLessons: 15,
      currentLesson: 3,
      completedLessons: [1, 2],
      perfectQuizzes: 1,
      profitableSimulations: 0,
    }),
  );

  const strategyId = `local-${now}`;
  const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();

  const strategies = [
    {
      id: strategyId,
      name: 'BTC Wheel Demo',
      ticker: 'BTC',
      total_capital: 50000,
      created_at: createdAt,
      plan_duration_months: 12,
      target_monthly_return: 5,
    },
  ];

  storage.setItem('btcwheel_strategies', JSON.stringify(strategies));
  storage.setItem('btcwheel_selected_strategy_id_local', strategyId);

  const trades = [
    {
      id: `t-${now}-1`,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      type: 'put',
      action: 'sell',
      strike: 48000,
      premium: 500,
      quantity: 1,
      ticker: 'BTC',
      expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().split('T')[0],
      pnl: 500,
      status: 'open',
      capital: 48000,
    },
    {
      id: `t-${now}-2`,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString().split('T')[0],
      type: 'call',
      action: 'sell',
      strike: 52000,
      premium: 0.01,
      quantity: 1,
      ticker: 'BTC',
      expiry: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
      pnl: 0.01,
      status: 'closed',
      capital: 1,
    },
  ];

  storage.setItem(`btcwheel_trades_${strategyId}`, JSON.stringify(trades));
}

