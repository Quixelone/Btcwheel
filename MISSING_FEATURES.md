# 🚀 Funzionalità Mancanti (Futures)

Basato sul Piano di Implementazione v1.0.0 e sullo stato attuale del progetto.

## 🔴 Priorità Alta (Core Trading)

Queste funzionalità sono essenziali per rendere l'app "viva" e utile quotidianamente.

1.  **Tracking Posizioni Real-Time**
    *   **Stato:** Parziale (solo bilanci).
    *   **Manca:** Fetch automatico delle posizioni aperte (Opzioni/Futures) da Deribit e Pionex.
    *   **Obiettivo:** L'utente deve vedere le sue opzioni attive nella Home/Trading senza doverle inserire a mano.

2.  **Auto-Sync Trade Journal**
    *   **Stato:** Manuale.
    *   **Manca:** Quando l'app rileva una nuova posizione sull'exchange, dovrebbe creare automaticamente una bozza di entry nel Trade Journal.

3.  **Dashboard Unificata (Exchange Hub)**
    *   **Stato:** Placeholder.
    *   **Manca:** Una vista aggregata che somma i capitali di tutti gli exchange collegati per dare il "Net Worth" totale in tempo reale.

## 🟡 Priorità Media (AI & Academy)

Funzionalità che danno valore aggiunto e differenziano l'app.

4.  **Backend "Prof Satoshi" (Daily Briefing)**
    *   **Stato:** Mock / Statico.
    *   **Manca:** Il motore che scarica news/dati reali (Fear&Greed, Prezzo BTC, Volatilità) per generare il briefing giornaliero dinamico.

5.  **Quiz Dinamici (NotebookLM)**
    *   **Stato:** Statico.
    *   **Manca:** Integrazione API per generare domande diverse ogni volta basate sugli errori precedenti dell'utente.

6.  **Contenuti Academy (Fase 1)**
    *   **Stato:** Struttura pronta.
    *   **Manca:** Inserimento effettivo dei testi e video per le 6 lezioni base ("Fondamenta").

## 🟢 Priorità Bassa (Espansione)

Da implementare dopo il lancio MVP.

7.  **Confronto Premium Cross-Exchange**
    *   **Manca:** Tabella che mostra dove conviene aprire una posizione (es. "Deribit paga il 12%, Binance il 10%").

8.  **Notifiche & Telegram Bot**
    *   **Manca:** Sistema di notifiche push per avvisare del Daily Briefing o scadenze opzioni.

9.  **Pagamenti (Stripe)**
    *   **Manca:** Gestione abbonamenti Free/Pro.

---

### 💡 Prossimo Passo Consigliato
Concentrarsi sul punto **1. Tracking Posizioni Real-Time**. È il "wow factor" che fa sentire l'utente in controllo dei suoi investimenti.
