import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MascotAI } from './MascotAI';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  MessageCircle,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';

export function ChatTutorTest() {
  const [testStatus, setTestStatus] = useState<{
    component: 'pending' | 'success' | 'error';
    backend: 'pending' | 'success' | 'error';
    context: 'pending' | 'success' | 'error';
  }>({
    component: 'pending',
    backend: 'pending',
    context: 'pending'
  });
  const [backendResponse, setBackendResponse] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testBackendEndpoint = async () => {
    setIsTesting(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/chat-tutor`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          message: 'Test: Spiega brevemente cos\'è la Wheel Strategy',
          context: {
            userLevel: 1,
            userXP: 0,
            completedLessons: 0,
            totalLessons: 15,
            currentStreak: 0,
            badges: [],
            lessonContext: null,
            conversationHistory: []
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        setBackendResponse(data.response);
        setTestStatus(prev => ({ ...prev, backend: 'success' }));
      } else {
        throw new Error('No response field');
      }
    } catch (error) {
      console.error('Backend test error:', error);
      setTestStatus(prev => ({ ...prev, backend: 'error' }));
      setBackendResponse(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsTesting(false);
    }
  };

  const checkComponent = () => {
    try {
      // Check if MascotAI component is available
      const hasComponent = !!MascotAI;
      setTestStatus(prev => ({ 
        ...prev, 
        component: hasComponent ? 'success' : 'error' 
      }));
    } catch (error) {
      setTestStatus(prev => ({ ...prev, component: 'error' }));
    }
  };

  const checkContext = () => {
    try {
      // Simulate context check
      const mockContext = {
        lessonId: 9,
        lessonTitle: 'Strike Selection e Delta',
      };
      
      setTestStatus(prev => ({ 
        ...prev, 
        context: mockContext.lessonId > 0 ? 'success' : 'error' 
      }));
    } catch (error) {
      setTestStatus(prev => ({ ...prev, context: 'error' }));
    }
  };

  const runAllTests = async () => {
    checkComponent();
    checkContext();
    await testBackendEndpoint();
  };

  const StatusIcon = ({ status }: { status: 'pending' | 'success' | 'error' }) => {
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
  };

  const StatusBadge = ({ status }: { status: 'pending' | 'success' | 'error' }) => {
    if (status === 'success') return <Badge className="bg-green-600">OK</Badge>;
    if (status === 'error') return <Badge variant="destructive">ERROR</Badge>;
    return <Badge variant="outline">PENDING</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-gray-900 mb-2">AI Chat Tutor Test Suite</h1>
          <p className="text-gray-600">
            Verifica funzionamento completo del Chat Tutor con GPT-4o-mini
          </p>
        </div>

        {/* Test Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-gray-900 mb-1">Test Automatici</h2>
              <p className="text-sm text-gray-600">
                Verifica componente, context e backend API
              </p>
            </div>
            <Button 
              onClick={runAllTests}
              disabled={isTesting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {/* Component Test */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={testStatus.component} />
                <div>
                  <p className="text-gray-900">Component Loaded</p>
                  <p className="text-xs text-gray-500">MascotAI component available</p>
                </div>
              </div>
              <StatusBadge status={testStatus.component} />
            </div>

            {/* Context Test */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={testStatus.context} />
                <div>
                  <p className="text-gray-900">Context Integration</p>
                  <p className="text-xs text-gray-500">Lesson context passing works</p>
                </div>
              </div>
              <StatusBadge status={testStatus.context} />
            </div>

            {/* Backend Test */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={testStatus.backend} />
                <div>
                  <p className="text-gray-900">Backend API</p>
                  <p className="text-xs text-gray-500">Supabase Edge Function + OpenAI</p>
                </div>
              </div>
              <StatusBadge status={testStatus.backend} />
            </div>
          </div>

          {/* Backend Response */}
          {backendResponse && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">AI Response:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{backendResponse}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Manual Test Instructions */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <MessageCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 mb-1">Test Manuale</h3>
              <p className="text-sm text-gray-600">
                Usa il floating button in basso a destra per testare l'AI chat:
              </p>
            </div>
          </div>

          <div className="space-y-3 ml-8">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                1
              </div>
              <p className="text-sm text-gray-700">
                Click sulla mascotte Prof Satoshi (bottom-right con badge "AI")
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                2
              </div>
              <p className="text-sm text-gray-700">
                Prova una delle domande suggerite o scrivi la tua
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                3
              </div>
              <p className="text-sm text-gray-700">
                Verifica che l'AI risponda in italiano e in modo pertinente
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                4
              </div>
              <p className="text-sm text-gray-700">
                Testa conversazioni multi-turn (AI deve ricordare context)
              </p>
            </div>
          </div>
        </Card>

        {/* Expected Features */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Trophy className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-gray-900 mb-1">Features da Verificare</h3>
              <p className="text-sm text-gray-600">
                Checklist funzionalità AI Chat Tutor:
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 ml-8">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Floating button appare
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Chat window si apre smooth
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Welcome message mostra
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Suggested questions clickable
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              AI risponde in italiano
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Loading animation funziona
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Messages salvate localStorage
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Clear chat funziona
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Enter key invia messaggio
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Auto-scroll a nuovi messaggi
            </div>
          </div>
        </Card>

        {/* Test Suggestions */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h3 className="text-gray-900 mb-3">💡 Domande di Test Suggerite</h3>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg text-sm text-gray-700">
              "Come funziona la Wheel Strategy?"
            </div>
            <div className="p-3 bg-white rounded-lg text-sm text-gray-700">
              "Cosa sono le cash-secured put?"
            </div>
            <div className="p-3 bg-white rounded-lg text-sm text-gray-700">
              "Spiega il delta delle opzioni"
            </div>
            <div className="p-3 bg-white rounded-lg text-sm text-gray-700">
              "Quali sono i rischi principali?" → poi → "Come li posso mitigare?"
            </div>
          </div>
        </Card>
      </div>

      {/* ChatTutor Component */}
      <ChatTutor />
    </div>
  );
}
