import { useAuthStore } from "../stores/authStore";

export function Perfil() {
  const { user } = useAuthStore();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de usuario
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {user?.user_metadata?.display_name || user?.email || 'Usuario'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {user?.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de registro
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'No disponible'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
