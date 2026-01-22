import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, RefreshCcw, Database } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SupabaseTestView() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {
      configCheck: false,
      projectId: null,
      hasAnonKey: false,
      supabaseUrl: null,
      clientCreated: false,
      pingSuccess: false,
      error: null,
    };

    try {
      // Test 1: Check configuration
      testResults.configCheck = isSupabaseConfigured;
      testResults.projectId = projectId;
      testResults.hasAnonKey = !!(publicAnonKey && publicAnonKey.length > 0);
      testResults.supabaseUrl = `https://${projectId}.supabase.co`;

      // Test 2: Check if client was created
      testResults.clientCreated = !!supabase;

      // Test 3: Try to ping Supabase
      if (supabase && isSupabaseConfigured) {
        try {
          // Try to get session (this will ping Supabase)
          const { error } = await supabase.auth.getSession();
          if (!error) {
            testResults.pingSuccess = true;
          } else {
            testResults.error = error.message;
          }
        } catch (err: any) {
          testResults.error = err.message;
        }
      }
    } catch (err: any) {
      testResults.error = err.message;
    }

    setResults(testResults);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
        <Card className="p-8 max-w-2xl w-full">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p>Testing Supabase connection...</p>
          </div>
        </Card>
      </div>
    );
  }

  const allTestsPassed = results.configCheck && results.clientCreated && results.pingSuccess;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-gray-900">Supabase Connection Test</h1>
        </div>

        {/* Overall Status */}
        <Alert className={`mb-6 ${allTestsPassed ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
          <div className="flex items-center gap-2">
            {allTestsPassed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-orange-600" />
            )}
            <AlertDescription className={allTestsPassed ? 'text-green-900' : 'text-orange-900'}>
              {allTestsPassed
                ? '✅ Supabase is configured correctly!'
                : '⚠️ Some tests failed. See details below.'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Test Results */}
        <div className="space-y-4">
          {/* Test 1: Configuration */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.configCheck ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Configuration Check</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.configCheck
                  ? 'Credentials loaded successfully'
                  : 'Missing credentials in info.tsx'}
              </p>
            </div>
          </div>

          {/* Test 2: Project ID */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.projectId ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Project ID</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.projectId ? (
                  <code className="bg-white px-2 py-1 rounded">{results.projectId}</code>
                ) : (
                  'Not found'
                )}
              </p>
            </div>
          </div>

          {/* Test 3: Anon Key */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.hasAnonKey ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Anon Key</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.hasAnonKey ? (
                  <>
                    <code className="bg-white px-2 py-1 rounded">
                      {publicAnonKey.substring(0, 20)}...{publicAnonKey.slice(-10)}
                    </code>
                  </>
                ) : (
                  'Not found'
                )}
              </p>
            </div>
          </div>

          {/* Test 4: Supabase URL */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.supabaseUrl ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Supabase URL</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.supabaseUrl ? (
                  <code className="bg-white px-2 py-1 rounded">{results.supabaseUrl}</code>
                ) : (
                  'Could not construct URL'
                )}
              </p>
            </div>
          </div>

          {/* Test 5: Client Creation */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.clientCreated ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Supabase Client</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.clientCreated
                  ? 'Client created successfully'
                  : 'Failed to create client'}
              </p>
            </div>
          </div>

          {/* Test 6: Connection Test */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            {results.pingSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">Server Connection</p>
              <p className="text-sm text-gray-600 mt-1">
                {results.pingSuccess
                  ? 'Successfully connected to Supabase server'
                  : results.error || 'Could not reach server'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Details */}
        {results.error && (
          <Alert variant="destructive" className="mt-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error Details:</strong>
              <pre className="mt-2 text-xs overflow-auto">{results.error}</pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={runTests}
            disabled={testing}
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Re-run Tests
              </>
            )}
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Back to App
          </Button>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Next Steps:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
            {allTestsPassed ? (
              <>
                <li>✅ Authentication is ready!</li>
                <li>✅ Try creating an account with email/password</li>
                <li>⚠️ Google OAuth requires additional setup (see GOOGLE_OAUTH_SETUP.md)</li>
              </>
            ) : (
              <>
                <li>❌ Check if /utils/supabase/info.tsx exists</li>
                <li>❌ Verify credentials in info.tsx</li>
                <li>❌ Contact support if problem persists</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}
