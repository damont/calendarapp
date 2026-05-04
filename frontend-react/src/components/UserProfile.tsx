import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";

export function UserProfile() {
  const { user } = useAuth();
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<{ access_token: string; expires_in_days: number } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">User Profile</h1>
        <p className="text-gray-600">Not logged in</p>
      </div>
    );
  }

  const handleGenerateToken = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiClient.agentToken(expiresInDays);
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
    setCopied(false);
    setError('');
  };

  const baseUrl = window.location.origin;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">
        User Profile
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Profile Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.name}
            </h2>
          </div>
        </div>

        {/* Profile Information */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Name</div>
              <div className="text-gray-900">{user.name}</div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Email</div>
              <div className="text-gray-900">{user.email}</div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">User ID</div>
              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-200">
                {user.id}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Token Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Agent Access Token
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Generate a token for AI agents to access your account via the API.
          </p>

          {tokenResult ? (
            <div className="space-y-3">
              <div className="px-3 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                Token generated — valid for {tokenResult.expires_in_days} day{tokenResult.expires_in_days !== 1 ? 's' : ''}.
              </div>
              <textarea
                readOnly
                value={tokenResult.access_token}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono bg-gray-50 resize-none focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white ${
                  copied ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
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
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-900 font-medium hover:underline"
              >
                Generate Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleGenerateToken} className="space-y-3">
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                This uses your current signed-in session. No password re-entry is required.
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Token Duration
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Token'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
