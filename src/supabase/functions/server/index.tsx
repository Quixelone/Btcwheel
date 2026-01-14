import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { 
  getExchangeTrades, 
  testExchangeConnection,
  EXCHANGE_CONNECTORS 
} from "./exchange-connectors.tsx";
import wheelRoutes from "./wheel-routes.tsx";
import dataMigration from "./data-migration.tsx";
import adminMigration from "./admin-migration.tsx";
import dbDuplicate, { duplicateUserData } from "./db-duplicate.tsx";

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

// 🔐 AUTH ENDPOINTS

// Sign up endpoint - creates user with email confirmed automatically
app.post("/make-server-7c0f82ca/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    console.log(`📝 [Signup] Creating user: ${email}`);
    
    // Import createClient here
    const { createClient } = await import("npm:@supabase/supabase-js");
    
    
    // Create admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ [Signup] Supabase credentials not configured");
      return c.json({ error: "Server configuration error" }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user with admin API (auto-confirms email)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'User' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      // Check if user already exists
      if (error.code === 'email_exists' || error.message?.includes('already been registered')) {
        console.log("⚠️ [Signup] User already exists - this is normal behavior, returning conflict status");
        return c.json({ 
          error: 'Un account con questa email esiste già. Vai alla pagina di login.',
          code: 'email_exists',
          suggestion: 'Usa il tab "Accedi" invece di "Registrati"'
        }, 409); // 409 Conflict
      }
      
      // Only log other errors (not email_exists)
      console.error("❌ [Signup] Error creating user:", error);
      
      return c.json({ error: error.message }, 400);
    }
    
    console.log(`✅ [Signup] User created successfully: ${email}`);
    
    return c.json({ 
      user: data.user,
      message: "Account created successfully! You can now sign in."
    });
    
  } catch (error) {
    console.error("❌ [Signup] Unexpected error:", error);
    return c.json({ 
      error: "Internal server error",
      details: error.message 
    }, 500);
  }
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
    
    console.log("🤖 Raw AI response:", aiResponse);
    console.log("🤖 Response type:", typeof aiResponse);
    console.log("🤖 Response length:", aiResponse?.length);
    
    // Parse JSON response with cleanup for markdown code blocks
    let question;
    try {
      // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
      let cleanedResponse = aiResponse.trim();
      
      // Remove opening markdown
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      
      // Remove closing markdown
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      
      cleanedResponse = cleanedResponse.trim();
      
      console.log("🧹 Cleaned AI response:", cleanedResponse);
      console.log("🧹 Cleaned length:", cleanedResponse.length);
      
      // Try to parse
      question = JSON.parse(cleanedResponse);
      
      console.log("📦 Parsed question object:", JSON.stringify(question, null, 2));
      
      // Validate required fields
      if (!question.question || !question.options || !Array.isArray(question.options)) {
        console.error("❌ Missing required fields:", {
          hasQuestion: !!question.question,
          hasOptions: !!question.options,
          isArray: Array.isArray(question.options),
          optionsLength: question.options?.length
        });
        throw new Error('Invalid question structure - missing required fields');
      }
      
      if (question.options.length !== 4) {
        console.error("❌ Invalid options length:", question.options.length);
        throw new Error(`Invalid question structure - expected 4 options, got ${question.options.length}`);
      }
      
      // Validate correctAnswer is within range
      if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
        console.error("❌ Invalid correctAnswer:", question.correctAnswer);
        throw new Error(`Invalid correctAnswer: ${question.correctAnswer}`);
      }
      
      // Adjust XP based on difficulty
      if (difficulty === 'medium') question.xp = 50;
      if (difficulty === 'hard') question.xp = 80;
      
      console.log("✅ Successfully validated question");
      
    } catch (parseError) {
      console.error("❌ Failed to parse AI response");
      console.error("Parse error details:", parseError);
      console.error("Raw response was:", aiResponse);
      console.error("Cleaned response was:", cleanedResponse);
      return c.json({ 
        error: "Invalid AI response", 
        details: String(parseError),
        rawResponse: aiResponse?.substring(0, 200) + "..." // First 200 chars for debugging
      }, 500);
    }

    console.log("✅ Successfully generated question:", question.question);
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

// 🔌 EXCHANGE CONNECTORS ENDPOINTS

// Get list of supported exchanges
app.get("/make-server-7c0f82ca/exchanges", (c) => {
  const exchanges = Object.keys(EXCHANGE_CONNECTORS).map(key => ({
    id: key,
    name: EXCHANGE_CONNECTORS[key].name,
    supportsOptions: !!EXCHANGE_CONNECTORS[key].getOptionTrades
  }));
  return c.json({ exchanges });
});

// Test exchange connection
app.post("/make-server-7c0f82ca/exchanges/test-connection", async (c) => {
  try {
    const { exchange, apiKey, apiSecret } = await c.req.json();
    
    if (!exchange || !apiKey || !apiSecret) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const isConnected = await testExchangeConnection(exchange, apiKey, apiSecret);
    
    return c.json({ 
      success: isConnected,
      exchange: EXCHANGE_CONNECTORS[exchange.toLowerCase()]?.name
    });
  } catch (error) {
    console.error("Error testing exchange connection:", error);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// Get trades from exchange
app.post("/make-server-7c0f82ca/exchanges/get-trades", async (c) => {
  try {
    const { exchange, apiKey, apiSecret, startDate, endDate } = await c.req.json();
    
    if (!exchange || !apiKey || !apiSecret) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24h
    const end = endDate ? new Date(endDate) : new Date();
    
    console.log(`Fetching trades from ${exchange} for period ${start.toISOString()} to ${end.toISOString()}`);
    
    const trades = await getExchangeTrades(exchange, apiKey, apiSecret, start, end);
    
    // Filter wheel-related trades (options and BTC spot)
    const wheelTrades = trades.filter(t => 
      t.type === 'option' || 
      (t.type === 'spot' && (t.symbol.includes('BTC') || t.symbol.includes('USDT')))
    );
    
    // Calculate statistics
    const stats = {
      totalTrades: trades.length,
      wheelTrades: wheelTrades.length,
      optionTrades: trades.filter(t => t.type === 'option').length,
      totalPremium: trades.reduce((sum, t) => sum + (t.premium || 0), 0),
      totalFees: trades.reduce((sum, t) => sum + (t.fee || 0), 0)
    };
    
    return c.json({ 
      trades: wheelTrades,
      stats,
      exchange: EXCHANGE_CONNECTORS[exchange.toLowerCase()]?.name,
      period: { start: start.toISOString(), end: end.toISOString() }
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return c.json({ 
      error: error.message,
      trades: [],
      stats: {}
    }, 500);
  }
});

// Save exchange API credentials (encrypted in KV store)
app.post("/make-server-7c0f82ca/exchanges/save-credentials", async (c) => {
  try {
    const { userId, exchange, apiKey, apiSecret, passphrase } = await c.req.json();
    
    if (!userId || !exchange || !apiKey || !apiSecret) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Test connection before saving
    const isValid = await testExchangeConnection(exchange, apiKey, apiSecret);
    if (!isValid) {
      return c.json({ error: "Invalid API credentials" }, 401);
    }
    
    // Save encrypted credentials to KV store
    const credentialKey = `user:${userId}:exchange:${exchange}`;
    await kv.set(credentialKey, {
      exchange,
      apiKey,
      apiSecret: apiSecret.substring(0, 8) + '***', // Store only partial for security
      passphrase: passphrase || null,
      createdAt: new Date().toISOString(),
      verified: true
    });
    
    return c.json({ 
      success: true,
      message: `Credenziali per ${EXCHANGE_CONNECTORS[exchange.toLowerCase()]?.name} salvate con successo!`
    });
  } catch (error) {
    console.error("Error saving credentials:", error);
    return c.json({ 
      error: error.message 
    }, 500);
  }
});

// Get saved exchanges for user
app.get("/make-server-7c0f82ca/exchanges/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    // Get all exchange credentials for this user
    const prefix = `user:${userId}:exchange:`;
    const credentials = await kv.getByPrefix(prefix);
    
    const exchanges = credentials.map(cred => ({
      exchange: cred.value.exchange,
      name: EXCHANGE_CONNECTORS[cred.value.exchange.toLowerCase()]?.name,
      verified: cred.value.verified,
      createdAt: cred.value.createdAt
    }));
    
    return c.json({ exchanges });
  } catch (error) {
    console.error("Error fetching user exchanges:", error);
    return c.json({ 
      exchanges: [],
      error: error.message 
    }, 500);
  }
});

// 🎯 WHEEL STRATEGY ROUTES - Mount the wheel routes
app.route("/", wheelRoutes);

// 🔄 DB DUPLICATE ROUTES - Mount the db duplicate routes
app.route("/", dbDuplicate);

// 👥 USER MANAGEMENT ROUTES - Mount the user management routes
import userManagement from "./user-management.tsx";
app.route("/", userManagement);

// 💰 BILLING & INVOICING ROUTES - Mount the billing routes
import adminBilling from "./admin-billing.tsx";
app.route("/", adminBilling);

// 📦 DATA MIGRATION & PORTING ROUTES

// List available data prefixes
app.get("/make-server-7c0f82ca/data/prefixes", async (c) => {
  try {
    const prefixes = await dataMigration.listDataPrefixes();
    return c.json({ prefixes });
  } catch (error) {
    console.error("Error listing prefixes:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Export user data
app.post("/make-server-7c0f82ca/data/export", async (c) => {
  try {
    const { userId, appPrefix = "btcwheel" } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }
    
    const exportData = await dataMigration.exportUserData(userId, appPrefix);
    
    return c.json({ 
      success: true,
      data: exportData,
      summary: {
        strategies: exportData.strategies.length,
        trades: Object.keys(exportData.trades).length,
        plans: exportData.plans.length,
        hasActivePlan: !!exportData.activePlan,
        hasUserProgress: !!exportData.userProgress
      }
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Import user data
app.post("/make-server-7c0f82ca/data/import", async (c) => {
  try {
    const { userId, data, targetPrefix = "btcwheel", mergeMode = false } = await c.req.json();
    
    if (!userId || !data) {
      return c.json({ error: "Missing userId or data" }, 400);
    }
    
    const result = await dataMigration.importUserData(userId, data, targetPrefix, mergeMode);
    
    return c.json({ 
      success: result.success,
      importedCount: result.importedCount,
      errors: result.errors
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Migrate data between prefixes
app.post("/make-server-7c0f82ca/data/migrate", async (c) => {
  try {
    const { userId, sourcePrefix, targetPrefix = "btcwheel" } = await c.req.json();
    
    if (!sourcePrefix) {
      return c.json({ error: "Missing sourcePrefix" }, 400);
    }
    
    const result = await dataMigration.migrateData({
      sourcePrefix,
      targetPrefix,
      userId
    });
    
    return c.json({ 
      success: result.success,
      migratedCount: result.migratedCount,
      errors: result.errors
    });
  } catch (error) {
    console.error("Error migrating data:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 👑 ADMIN MIGRATION ROUTES (Mass Migration)

// Get database statistics
app.get("/make-server-7c0f82ca/admin/stats", async (c) => {
  try {
    const stats = await adminMigration.getDatabaseStats();
    return c.json({ stats });
  } catch (error) {
    console.error("Error getting database stats:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Scan for users with data in a specific prefix
app.post("/make-server-7c0f82ca/admin/scan-users", async (c) => {
  try {
    const { sourcePrefix = "finanzacreativa" } = await c.req.json();
    
    const users = await adminMigration.scanUsersWithData(sourcePrefix);
    
    return c.json({ 
      success: true,
      userCount: users.length,
      users 
    });
  } catch (error) {
    console.error("Error scanning users:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Migrate all users or specific users in batch
app.post("/make-server-7c0f82ca/admin/migrate-batch", async (c) => {
  try {
    const { 
      sourcePrefix = "finanzacreativa", 
      targetPrefix = "btcwheel",
      userIds // Optional: array of specific user IDs to migrate
    } = await c.req.json();
    
    console.log(`🚀 Starting batch migration: ${sourcePrefix} -> ${targetPrefix}`);
    if (userIds) {
      console.log(`  Migrating ${userIds.length} specific users`);
    }
    
    const result = await adminMigration.migrateAllUsers(
      sourcePrefix, 
      targetPrefix, 
      userIds
    );
    
    return c.json({ 
      success: result.failedCount === 0,
      ...result
    });
  } catch (error) {
    console.error("Error in batch migration:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete all data for a prefix (DANGEROUS - use with caution)
app.post("/make-server-7c0f82ca/admin/delete-prefix", async (c) => {
  try {
    const { prefix, userId, confirmToken } = await c.req.json();
    
    // Safety check: require confirmation token
    if (confirmToken !== "DELETE_CONFIRMED") {
      return c.json({ error: "Missing or invalid confirmation token" }, 403);
    }
    
    if (!prefix) {
      return c.json({ error: "Missing prefix" }, 400);
    }
    
    console.log(`⚠️ WARNING: Deleting all data for prefix: ${prefix}`);
    
    const result = await adminMigration.deleteAllDataForPrefix(prefix, userId);
    
    return c.json({ 
      success: result.errors.length === 0,
      deletedCount: result.deletedCount,
      errors: result.errors
    });
  } catch (error) {
    console.error("Error deleting prefix data:", error);
    return c.json({ error: error.message }, 500);
  }
});

// DB DUPLICATE ROUTES

// Duplicate a user's data from one prefix to another
app.post("/make-server-7c0f82ca/admin/duplicate-user", async (c) => {
  try {
    const { userId, sourcePrefix, targetPrefix } = await c.req.json();
    
    if (!userId || !sourcePrefix || !targetPrefix) {
      return c.json({ error: "Missing userId, sourcePrefix, or targetPrefix" }, 400);
    }
    
    const result = await duplicateUserData(userId, sourcePrefix, targetPrefix);
    
    return c.json({ 
      success: result.success,
      duplicatedCount: result.duplicatedCount,
      errors: result.errors
    });
  } catch (error: any) {
    console.error("Error duplicating user data:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
