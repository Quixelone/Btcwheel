import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7c0f82ca/health", (c) => {
  return c.json({ status: "ok" });
});

// 🎯 AI Quiz Question Generator
app.post("/make-server-7c0f82ca/generate-quiz-question", async (c) => {
  try {
    // 🤖 Support both OpenAI and Grok (xAI)
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    
    // Determine which AI to use
    const useGrok = GROK_API_KEY && !OPENAI_API_KEY;
    const apiKey = useGrok ? GROK_API_KEY : OPENAI_API_KEY;
    const apiUrl = useGrok 
      ? "https://api.x.ai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = useGrok ? "grok-beta" : "gpt-4o-mini";
    
    if (!apiKey) {
      console.warn("No AI API key configured - set OPENAI_API_KEY or GROK_API_KEY");
      return c.json({ error: "AI not configured" }, 503);
    }

    console.log(`🤖 Using AI provider: ${useGrok ? 'Grok (xAI)' : 'OpenAI'} - Model: ${model}`);

    const { lessonId, lessonTitle, lessonContent, difficulty, performance } = await c.req.json();
    
    // Extract previous questions to avoid repetition
    const previousQuestions = performance?.previousQuestions || [];
    const weakTopics = performance?.weakTopics || [];
    
    // Build dynamic prompt based on difficulty and performance
    let difficultyInstruction = '';
    if (difficulty === 'easy') {
      difficultyInstruction = 'Crea una domanda BASE con concetti fondamentali. Opzioni chiare e distinte.';
    } else if (difficulty === 'medium') {
      difficultyInstruction = 'Crea una domanda di LIVELLO INTERMEDIO che richiede comprensione più profonda. Opzioni che richiedono ragionamento.';
    } else {
      difficultyInstruction = 'Crea una domanda AVANZATA che combina più concetti. Opzioni simili che richiedono analisi critica.';
    }

    const prompt = `Sei un esperto di Bitcoin Wheel Strategy che crea quiz educativi.

LEZIONE: ${lessonTitle}
CONTENUTO: ${lessonContent}

ISTRUZIONI:
${difficultyInstruction}

${weakTopics.length > 0 ? `PUNTI DEBOLI UTENTE: ${weakTopics.join(', ')} - Crea domande che aiutino a rafforzare questi concetti.` : ''}

${previousQuestions.length > 0 ? `DOMANDE GIÀ FATTE (NON RIPETERE QUESTI CONCETTI):
${previousQuestions.slice(-5).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}` : ''}

Genera UNA domanda UNICA e ORIGINALE (mai fatta prima) in formato JSON:
{
  "question": "La domanda (chiara e specifica)",
  "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
  "correctAnswer": 0,
  "explanation": "Spiegazione dettagliata della risposta corretta (2-3 frasi)",
  "xp": 30,
  "hint": "Suggerimento utile se l'utente sbaglia"
}

REGOLE CRITICHE:
- La domanda DEVE essere completamente diversa da quelle già fatte
- Esplora aspetti diversi del contenuto della lezione
- 4 opzioni di risposta credibili
- Spiegazione educativa e motivante
- XP: 30 per easy, 50 per medium, 80 per hard
- Hint deve guidare senza dare la risposta
- Randomizza l'ordine della risposta corretta (non sempre 0)`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Sei un generatore di quiz educativi. Rispondi SOLO con JSON valido, nessun testo aggiuntivo."
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.8, // Più creatività per domande variegate
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${useGrok ? 'Grok' : 'OpenAI'} API error:`, response.status, errorText);
      return c.json({ error: "AI generation failed", details: errorText }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    let question;
    try {
      question = JSON.parse(aiResponse);
      
      // Adjust XP based on difficulty
      if (difficulty === 'medium') question.xp = 50;
      if (difficulty === 'hard') question.xp = 80;
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return c.json({ error: "Invalid AI response" }, 500);
    }

    return c.json({ question });
    
  } catch (error) {
    console.error("Error in generate-quiz-question:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// 🎯 AI Quiz Feedback Generator
app.post("/make-server-7c0f82ca/get-quiz-feedback", async (c) => {
  try {
    // 🤖 Support both OpenAI and Grok (xAI)
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    
    const useGrok = GROK_API_KEY && !OPENAI_API_KEY;
    const apiKey = useGrok ? GROK_API_KEY : OPENAI_API_KEY;
    const apiUrl = useGrok 
      ? "https://api.x.ai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = useGrok ? "grok-beta" : "gpt-4o-mini";
    
    if (!apiKey) {
      return c.json({ 
        feedback: "Hai commesso diversi errori. Ti consiglio di rivedere la lezione con più attenzione prima di continuare il quiz. 📚"
      });
    }

    const { lessonTitle, wrongAnswers, performance } = await c.req.json();
    
    // Calculate accuracy
    const accuracy = performance.accuracy || 
      (performance.correctAnswers / (performance.correctAnswers + performance.wrongAnswers) * 100);
    
    const prompt = `L'utente sta studiando: "${lessonTitle}"

PERFORMANCE:
- Risposte corrette: ${performance.correctAnswers}
- Risposte sbagliate: ${performance.wrongAnswers}
- Accuracy: ${Math.round(accuracy)}%
- Errori consecutivi: ${performance.consecutiveWrong}
- Punti deboli: ${performance.weakTopics.join(', ') || 'nessuno identificato'}

DOMANDE SBAGLIATE:
${wrongAnswers.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Fornisci un feedback MOTIVANTE E COSTRUTTIVO (max 100 parole) che:
1. Incoraggi l'utente (tono positivo ma onesto)
2. Identifichi il pattern degli errori
3. Suggerisca cosa rivedere specificamente nella lezione
4. Motivi a riprovare dopo aver studiato meglio i concetti deboli

${accuracy < 50 ? '⚠️ IMPORTANTE: L\'accuracy è bassa. Sii DIRETTO nel consigliare di rivedere la lezione prima di continuare.' : ''}

Usa emoji appropriati. Sii empatico ma chiaro.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Sei Prof Satoshi, un tutor motivante che aiuta gli studenti a imparare la Bitcoin Wheel Strategy. Dai feedback costruttivi e incoraggianti."
          },
          {
            role: "user",
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error("AI API error");
    }

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    return c.json({ feedback });
    
  } catch (error) {
    console.error("Error in get-quiz-feedback:", error);
    return c.json({ 
      feedback: "Sembra che tu abbia qualche difficoltà. Prova a rivedere la lezione con più attenzione! 💪"
    });
  }
});

// OpenAI Onboarding Analysis Endpoint
app.post("/make-server-7c0f82ca/analyze-profile", async (c) => {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured on server");
      return c.json({ useFallback: true }, 200);
    }

    const profile = await c.req.json();
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Sei un esperto coach di trading Bitcoin e strategie Wheel. 
Il tuo compito è analizzare il profilo dell'utente e creare un percorso formativo personalizzato.
Rispondi SOLO con un JSON valido nel seguente formato:
{
  "startingLesson": <numero 1-15>,
  "recommendedPath": ["Lezione 1", "Lezione 2", ...],
  "estimatedDuration": "es. 2-3 settimane",
  "focusAreas": ["Area 1", "Area 2", ...],
  "tips": ["Tip 1", "Tip 2", ...],
  "customMessage": "Messaggio personalizzato motivazionale"
}`,
          },
          {
            role: "user",
            content: `Analizza questo profilo utente e crea un percorso formativo personalizzato per imparare la Bitcoin Wheel Strategy:

Livello esperienza crypto: ${profile.experienceLevel}
Conoscenza trading: ${profile.tradingKnowledge}
Conoscenza opzioni: ${profile.optionsKnowledge}
Obiettivi: ${profile.goals.join(", ")}
Tempo disponibile: ${profile.availableTime}
Capitale disponibile: ${profile.capital}
Stile apprendimento: ${profile.learningStyle.join(", ")}

Lezioni disponibili (15 totali):
1. Introduzione Bitcoin e Volatilità
2. Cos'è la Wheel Strategy
3. Fondamenti Opzioni: Put e Call
4. Vendere Put Cash-Secured
5. Strike Selection e Delta
6. Gestione Rischio Base
7. Time Decay e Theta
8. Quando Venire Assegnati
9. Roll & Adjust
10. Covered Call dopo Assegnazione
11. Greeks Avanzati
12. Gestione Portfolio
13. Tax Implications
14. Strategie Mercato Ribassista
15. Strategie Avanzate Multi-Leg

Crea un percorso ottimale considerando il livello dell'utente.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return c.json({ 
        error: `OpenAI API error: ${response.status}`,
        useFallback: true 
      }, 200);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("No content in OpenAI response");
      return c.json({ useFallback: true }, 200);
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in OpenAI response");
      return c.json({ useFallback: true }, 200);
    }

    const recommendation = JSON.parse(jsonMatch[0]);
    return c.json({ recommendation }, 200);
  } catch (error) {
    console.error("Error in analyze-profile endpoint:", error);
    return c.json({ 
      error: error.message,
      useFallback: true 
    }, 200);
  }
});

// OpenAI Chat Tutor Endpoint
app.post("/make-server-7c0f82ca/chat-tutor", async (c) => {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      return c.json({ 
        response: "Mi dispiace, l'AI tutor non è configurato al momento. Prova a consultare le lezioni o continua il tuo percorso di apprendimento! 📚"
      }, 200);
    }

    const { message: userMessage, context } = await c.req.json();
    
    // Build system prompt with user context
    let systemPrompt = `Sei un tutor esperto di Bitcoin Wheel Strategy. Rispondi in italiano in modo chiaro, conciso e educativo. 
Usa esempi pratici quando possibile. Se l'utente fa domande non correlate al trading, reindirizzalo gentilmente verso il corso.

CONTESTO UTENTE:
- Livello: ${context?.userLevel || 1}
- XP: ${context?.userXP || 0}
- Lezioni completate: ${context?.completedLessons || 0}/${context?.totalLessons || 15}
- Streak: ${context?.currentStreak || 0} giorni
- Badge: ${context?.badges?.length || 0}`;

    if (context?.lessonContext) {
      systemPrompt += `\n\nCONTESTO LEZIONE CORRENTE:
- Lezione #${context.lessonContext.lessonId}: ${context.lessonContext.lessonTitle}
${context.lessonContext.currentSection ? `- Sezione: ${context.lessonContext.currentSection}` : ''}

Fornisci risposte pertinenti al contesto della lezione quando appropriato.`;
    }

    systemPrompt += `\n\nRISPONDI IN MASSIMO 200-250 PAROLE. Usa emoji quando appropriato per rendere la risposta più engaging.`;

    // Build conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      }
    ];

    // Add conversation history (last 4 messages)
    if (context?.conversationHistory && context.conversationHistory.length > 0) {
      context.conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI chat error:", response.status, errorText);
      return c.json({ 
        response: "Si è verificato un errore temporaneo. Riprova tra poco! 🔄"
      }, 200);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || "Mi dispiace, non ho capito. Puoi riformulare? 🤔";
    
    return c.json({ response: assistantMessage }, 200);
  } catch (error) {
    console.error("Error in chat-tutor endpoint:", error);
    return c.json({ 
      response: "Si è verificato un errore. Riprova tra poco o continua con le lezioni! 📚"
    }, 200);
  }
});

Deno.serve(app.fetch);