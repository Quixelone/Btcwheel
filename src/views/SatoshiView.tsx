/**
 * SatoshiView - BTC Wheel Pro 2.0
 * 
 * Sezione Prof Satoshi con:
 * - Daily Briefing guidato passo-passo
 * - 3 Strike Consigliati con istruzioni chiare
 * - Chat Assistant
 * - Storico Briefing
 */

import { useState, useEffect, useRef } from 'react';
import {
    Bot,
    Send,
    User,
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader } from '../components/layout/PageWrapper';
import { BaseCard } from '../components/ui/cards';
import { DailyBriefing } from '../components/satoshi/DailyBriefing';
import { satoshiService } from '../services/satoshiService';
import { BriefingData } from '../types/satoshi';
import { useSatoshiChat } from '../hooks/useSatoshiChat';
import { motion, AnimatePresence } from 'motion/react';

interface SatoshiViewProps {
    currentView: View;
    onNavigate: (view: View, params?: any) => void;
}

export function SatoshiView({ currentView, onNavigate }: SatoshiViewProps) {
    const [briefingData, setBriefingData] = useState<BriefingData | null>(null);

    // Chat Hook
    const { messages, sendMessage, isTyping } = useSatoshiChat();
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load daily briefing data
        const data = satoshiService.getDailyBriefing();
        setBriefingData(data);
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (currentView === 'satoshi-chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentView, isTyping]);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        sendMessage(chatInput);
        setChatInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Determine which sub-view to show
    if (currentView === 'satoshi-chat') {
        return (
            <PageWrapper>
                <PageContent>
                    <PageHeader
                        title="Parla con Satoshi"
                        subtitle="Fai qualsiasi domanda sulla Wheel Strategy o sull'app"
                    />

                    {/* Chat Interface */}
                    <BaseCard className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] p-0 overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : 'bg-cyan-500/20 text-cyan-400'
                                            }`}>
                                            {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : 'bg-white/10 text-slate-200 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex gap-3 max-w-[80%]">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-white/[0.05] p-4 bg-black/20">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Scrivi un messaggio..."
                                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#666677] focus:outline-none focus:border-purple-500/50 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isTyping}
                                    className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </BaseCard>
                </PageContent>
            </PageWrapper>
        );
    }

    if (currentView === 'satoshi-history') {
        return (
            <PageWrapper>
                <PageContent>
                    <PageHeader
                        title="Storico Briefing"
                        subtitle="Gli ultimi 30 giorni di analisi"
                    />

                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - i);
                            const biases = ['bullish', 'bearish', 'neutral'] as const;
                            const randomBias = biases[i % 3];

                            return (
                                <BaseCard key={i} onClick={() => { }} className="group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm font-medium text-[#888899]">
                                                {date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <span className={`
                        text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${randomBias === 'bullish' ? 'bg-green-500/10 text-green-400' :
                                                    randomBias === 'bearish' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'}
                      `}>
                                                {randomBias}
                                            </span>
                                        </div>
                                        <div className="text-sm text-[#666677]">
                                            Strike: $93,500 / $94,800 / $96,000
                                        </div>
                                    </div>
                                </BaseCard>
                            );
                        })}
                    </div>
                </PageContent>
            </PageWrapper>
        );
    }

    // ============================================
    // MAIN DAILY BRIEFING VIEW - GUIDATO
    // ============================================

    if (!briefingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageContent>
                <DailyBriefing
                    data={briefingData}
                    onNavigate={onNavigate}
                />
            </PageContent>
        </PageWrapper>
    );
}

export default SatoshiView;
