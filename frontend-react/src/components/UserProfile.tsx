import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">User Profile</h1>
        <p className="text-gray-600">Not logged in</p>
      </div>
    );
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    setIsEditing(false);
  };

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
            <p className="text-gray-600">
              Member since {new Date(user.id).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="border-t border-gray-200 pt-6">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 border border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
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

              <div className="pt-4">
                <button
                  onClick={() => {
                    setEditForm({ name: user.name, email: user.email });
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}