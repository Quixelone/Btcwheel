import { useState, useCallback } from 'react';
import { ChatMessage } from '../types/satoshi';

const INITIAL_MESSAGE: ChatMessage = {
    id: 'welcome',
    sender: 'satoshi',
    text: "Ciao! Sono Prof Satoshi. Come posso aiutarti oggi con la Wheel Strategy?",
    timestamp: Date.now()
};

export function useSatoshiChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = useCallback(async (text: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate AI delay
        setTimeout(() => {
            const responseText = generateMockResponse(text);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'satoshi',
                text: responseText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    }, []);

    return {
        messages,
        sendMessage,
        isTyping
    };
}

function generateMockResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('put')) return "Vendere una PUT è ottimo in un mercato rialzista o laterale. Assicurati di scegliere uno strike dove saresti felice di acquistare BTC.";
    if (lower.includes('call')) return "Vendi CALL solo se possiedi già i Bitcoin (Covered Call). È una strategia per generare rendita su asset che già detieni.";
    if (lower.includes('rischio') || lower.includes('risk')) return "Il rischio principale della Wheel Strategy è che il prezzo di BTC scenda drasticamente ben al di sotto del tuo strike price della PUT. In quel caso, ti vengono assegnati BTC a un prezzo superiore a quello di mercato.";
    if (lower.includes('strike')) return "La scelta dello strike dipende dalla tua tolleranza al rischio. Un Delta 0.30 (circa 30% probabilità ITM) è spesso un buon compromesso tra premium e sicurezza.";
    if (lower.includes('premium') || lower.includes('premio')) return "Il premium è il compenso che ricevi per vendere l'opzione. È tuo da subito, indipendentemente da come va il trade.";
    if (lower.includes('btc') || lower.includes('bitcoin')) return "Bitcoin è l'asset sottostante ideale per la Wheel Strategy grazie alla sua volatilità e al valore a lungo termine.";

    return "Interessante domanda. La Wheel Strategy richiede pazienza e disciplina. Posso spiegarti meglio come scegliere uno strike o come gestire il rischio, se vuoi.";
}
