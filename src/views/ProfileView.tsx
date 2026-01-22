/**
 * ProfileView - BTC Wheel Pro 2.0
 * 
 * Sezione Profilo con:
 * - Overview Profilo
 * - Obiettivo
 * - Profilo Rischio
 * - Notifiche
 * - Abbonamento
 * - Account
 */

import { motion } from 'motion/react';
import {
    User,
    Target,
    ShieldCheck,
    Bell,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,

    Check,
    ArrowLeft
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from '../components/layout/PageWrapper';
import { BaseCard, StatCard } from '../components/ui/cards';
import { useAuth } from '../hooks/useAuth';
import { useUserProgress } from '../hooks/useUserProgress';

interface ProfileViewProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

export function ProfileView({ currentView, onNavigate }: ProfileViewProps) {
    const { user, signOut } = useAuth();
    const { progress } = useUserProgress();

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Utente';
    const userEmail = user?.email || '';

    // Mock data
    const mockProfile = {
        riskProfile: 'moderato',
        objective: {
            name: 'Università di Marco',
            icon: '🎓',
            targetDate: 'Settembre 2038',
            targetAmount: 50000,
        },
        subscription: {
            plan: 'Free',
            canUpgrade: true,
        },
        notifications: {
            push: true,
            email: true,
            telegram: false,
        },
        stats: {
            memberSince: 'Gennaio 2026',
            totalOperations: 23,
            streakRecord: 12,
        },
    };

    const handleLogout = async () => {
        await signOut();
        // Navigate to landing instead of just reloading
        onNavigate('landing');
    };

    // Objective Edit View
    const [objectiveForm, setObjectiveForm] = useState({
        name: '',
        targetDate: '',
        targetAmount: ''
    });

    // Load objective data when entering the view
    useEffect(() => {
        if (currentView === 'objective' && user) {
            PersistenceService.load(user.id, 'user_objective').then(data => {
                if (data) {
                    setObjectiveForm({
                        name: data.name || '',
                        targetDate: data.targetDate || '',
                        targetAmount: data.targetAmount?.toString() || ''
                    });
                }
            });
        }
    }, [currentView, user]);

    const handleSaveObjective = async () => {
        if (!user) return;
        await PersistenceService.save(user.id, 'user_objective', {
            name: objectiveForm.name,
            targetDate: objectiveForm.targetDate,
            targetAmount: parseFloat(objectiveForm.targetAmount) || 0
        });
        // Update local mock/state if needed, or just notify
        alert('Obiettivo salvato con successo!');
        onNavigate('profile');
    };

    if (currentView === 'objective') {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al profilo</span>
                    </button>

                    <PageHeader
                        title="Il Tuo Obiettivo"
                        subtitle="Modifica il tuo obiettivo finanziario"
                    />

                    <BaseCard>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888899] mb-2 block">
                                    Nome obiettivo
                                </label>
                                <input
                                    type="text"
                                    value={objectiveForm.name}
                                    onChange={e => setObjectiveForm({ ...objectiveForm, name: e.target.value })}
                                    placeholder="Es. La mia libertà, Casa nuova..."
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888899] mb-2 block">
                                    Data obiettivo
                                </label>
                                <input
                                    type="date"
                                    value={objectiveForm.targetDate}
                                    onChange={e => setObjectiveForm({ ...objectiveForm, targetDate: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888899] mb-2 block">
                                    Importo target (€)
                                </label>
                                <input
                                    type="number"
                                    value={objectiveForm.targetAmount}
                                    onChange={e => setObjectiveForm({ ...objectiveForm, targetAmount: e.target.value })}
                                    placeholder="50000"
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                                />
                            </div>

                            <button
                                onClick={handleSaveObjective}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                            >
                                Salva Modifiche
                            </button>
                        </div>
                    </BaseCard>
                </PageContent>
            </PageWrapper>
        );
    }

    // Risk Profile View
    if (currentView === 'risk-profile') {
        const riskProfiles = [
            { id: 'conservativo', label: 'Conservativo', description: 'Strike lontani, bassi premium ma massima sicurezza' },
            { id: 'moderato', label: 'Moderato', description: 'Equilibrio tra rischio e rendimento' },
            { id: 'aggressivo', label: 'Aggressivo', description: 'Strike vicini, alti premium ma più rischio' },
        ];

        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al profilo</span>
                    </button>

                    <PageHeader
                        title="Profilo di Rischio"
                        subtitle="Il tuo profilo determina quali strike ti consiglia Prof Satoshi"
                    />

                    <div className="space-y-3">
                        {riskProfiles.map((profile) => (
                            <BaseCard
                                key={profile.id}
                                onClick={() => { }}
                                variant={profile.id === mockProfile.riskProfile ? 'highlighted' : 'default'}
                                className="group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white">{profile.label}</h3>
                                            {profile.id === mockProfile.riskProfile && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                                                    Attuale
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#888899]">{profile.description}</p>
                                    </div>
                                    <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${profile.id === mockProfile.riskProfile
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-[#444455] group-hover:border-[#666677]'
                                        }
                  `}>
                                        {profile.id === mockProfile.riskProfile && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                            </BaseCard>
                        ))}
                    </div>

                    <p className="text-xs text-[#666677] text-center mt-6">
                        Il profilo viene aggiornato anche automaticamente in base alle tue risposte ai quiz.
                    </p>
                </PageContent>
            </PageWrapper>
        );
    }

    // Notifications View
    if (currentView === 'notifications') {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al profilo</span>
                    </button>

                    <PageHeader
                        title="Notifiche"
                        subtitle="Gestisci come ricevi gli aggiornamenti"
                    />

                    <div className="space-y-3">
                        {[
                            { id: 'push', label: 'Push Notifications', description: 'Notifiche sul dispositivo', enabled: mockProfile.notifications.push },
                            { id: 'email', label: 'Email', description: 'Ricevi aggiornamenti via email', enabled: mockProfile.notifications.email },
                            { id: 'telegram', label: 'Telegram', description: 'Connetti il bot Telegram', enabled: mockProfile.notifications.telegram },
                        ].map((item) => (
                            <BaseCard key={item.id}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white">{item.label}</h3>
                                        <p className="text-sm text-[#888899]">{item.description}</p>
                                    </div>
                                    <button className={`
                    w-12 h-7 rounded-full transition-colors relative
                    ${item.enabled ? 'bg-purple-600' : 'bg-white/[0.1]'}
                  `}>
                                        <div className={`
                      w-5 h-5 rounded-full bg-white absolute top-1 transition-transform
                      ${item.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `} />
                                    </button>
                                </div>
                            </BaseCard>
                        ))}
                    </div>
                </PageContent>
            </PageWrapper>
        );
    }

    // Subscription View
    if (currentView === 'subscription') {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al profilo</span>
                    </button>

                    <PageHeader
                        title="Abbonamento"
                        subtitle="Gestisci il tuo piano"
                    />

                    <BaseCard variant="highlighted">
                        <div className="text-center py-6">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">
                                Piano attuale
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">FREE</h2>
                            <p className="text-[#888899]">Funzionalità base</p>
                        </div>
                    </BaseCard>

                    <BaseCard>
                        <div className="text-center py-6">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-green-400 mb-2">
                                Consigliato
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">PREMIUM</h2>
                            <div className="text-2xl font-bold text-white mb-4">
                                €29<span className="text-sm text-[#888899]">/mese</span>
                            </div>
                            <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
                                {[
                                    'Multi-exchange + confronto premium',
                                    '3 strike personalizzati',
                                    'Corso completo (tutte le fasi)',
                                    'Podcast personalizzati',
                                    'Assistenza prioritaria',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#888899]">
                                        <Check className="w-4 h-4 text-green-400 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all">
                                Passa a Premium
                            </button>
                        </div>
                    </BaseCard>
                </PageContent>
            </PageWrapper>
        );
    }

    // Account View
    if (currentView === 'account') {
        return (
            <PageWrapper>
                <PageContent>
                    <button
                        onClick={() => onNavigate('profile')}
                        className="flex items-center gap-2 text-[#888899] hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Torna al profilo</span>
                    </button>

                    <PageHeader
                        title="Account"
                        subtitle="Gestisci i tuoi dati"
                    />

                    <BaseCard>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888899] mb-2 block">
                                    Email
                                </label>
                                <div className="text-white">{userEmail}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#888899] mb-2 block">
                                    Nome
                                </label>
                                <div className="text-white">{userName}</div>
                            </div>
                        </div>
                    </BaseCard>

                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-colors"
                    >
                        Esci dall'account
                    </button>
                </PageContent>
            </PageWrapper>
        );
    }

    // Main Profile View (Overview)
    return (
        <PageWrapper>
            <PageContent>
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-6 mb-8"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{userName}</h1>
                        <p className="text-[#888899]">{userEmail}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-[#888899]">
                                {mockProfile.subscription.plan}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                                Profilo {mockProfile.riskProfile}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard
                        label="Membro da"
                        value={mockProfile.stats.memberSince.split(' ')[0]}
                        icon={User}
                        color="purple"
                    />
                    <StatCard
                        label="Operazioni"
                        value={mockProfile.stats.totalOperations}
                        icon={Target}
                        color="cyan"
                    />
                    <StatCard
                        label="Record Streak"
                        value={`${mockProfile.stats.streakRecord} sett`}
                        icon={ShieldCheck}
                        color="orange"
                    />
                </div>

                {/* Menu Items */}
                <section>
                    <SectionHeader title="Impostazioni" />
                    <div className="space-y-2 mt-4">
                        {[
                            { view: 'objective' as View, icon: Target, label: 'Il Mio Obiettivo', value: mockProfile.objective.name },
                            { view: 'risk-profile' as View, icon: ShieldCheck, label: 'Profilo di Rischio', value: mockProfile.riskProfile },
                            { view: 'notifications' as View, icon: Bell, label: 'Notifiche', value: '' },
                            { view: 'subscription' as View, icon: CreditCard, label: 'Abbonamento', value: mockProfile.subscription.plan },
                            { view: 'account' as View, icon: Settings, label: 'Account', value: '' },
                        ].map((item) => (
                            <BaseCard key={item.view} onClick={() => onNavigate(item.view)} className="group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-[#888899]" />
                                        </div>
                                        <span className="font-medium text-white">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.value && (
                                            <span className="text-sm text-[#666677]">{item.value}</span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </BaseCard>
                        ))}
                    </div>
                </section>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-white/[0.02] hover:bg-red-500/10 border border-white/[0.05] hover:border-red-500/20 text-[#888899] hover:text-red-400 font-medium rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Esci dall'account
                </button>
            </PageContent>
        </PageWrapper>
    );
}

export default ProfileView;
