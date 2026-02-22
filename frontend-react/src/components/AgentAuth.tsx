import { useState, type FormEvent } from 'react';
import { apiClient } from '../api/client';

interface AgentAuthProps {
  onSwitchToLogin: () => void;
}

interface TokenResult {
  access_token: string;
  expires_in_days: number;
}

export function AgentAuth({ onSwitchToLogin }: AgentAuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiClient.agentToken(username, password, expiresInDays);
      setTokenResult({
        access_token: result.access_token,
        expires_in_days: result.expires_in_days,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!tokenResult) return;
    await navigator.clipboard.writeText(tokenResult.access_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTokenResult(null);
    setPassword('');
    setCopied(false);
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-medium text-gray-900 mb-1">Family Calendar</h1>
        <p className="text-sm text-gray-500 mb-6">Generate an agent token</p>

        {tokenResult ? (
          <div className="space-y-4">
            <div className="px-3 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
              Agent token generated successfully
            </div>
            <p className="text-sm text-gray-600">
              This token is valid for {tokenResult.expires_in_days} day{tokenResult.expires_in_days !== 1 ? 's' : ''}.
            </p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Token</label>
              <textarea
                readOnly
                value={tokenResult.access_token}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50 resize-none focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`mt-2 w-full py-2 px-4 rounded-md text-sm font-medium text-white ${
                  copied ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">API Docs:</span>{' '}
                <code className="px-1 py-0.5 rounded text-xs bg-gray-100">{baseUrl}/api/agent</code>
              </div>
              <div>
                <span className="font-medium text-gray-900">API Base:</span>{' '}
                <code className="px-1 py-0.5 rounded text-xs bg-gray-100">{baseUrl}/api/</code>
              </div>
            </div>
            <div className="text-center space-y-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-900 font-medium hover:underline block w-full"
              >
                Generate Another
              </button>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-gray-500 hover:underline block w-full"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <div className="mb-4">
              <label htmlFor="agent-username" className="block text-sm text-gray-600 mb-2">
                Username
              </label>
              <input
                id="agent-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="agent-password" className="block text-sm text-gray-600 mb-2">
                Password
              </label>
              <input
                id="agent-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="agent-expires" className="block text-sm text-gray-600 mb-2">
                Token Duration
              </label>
              <select
                id="agent-expires"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                disabled={loading}
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>365 days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Agent Token'}
            </button>

            <p className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-gray-500 hover:underline"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
