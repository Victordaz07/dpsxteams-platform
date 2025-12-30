import { requireAuth, requireActiveOrg } from "@/lib/auth/guards";
import { getCurrentUserRole, getRBACContext } from "@/lib/auth/rbac";
import { getActiveOrganization } from "@/lib/db/organizations";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminDashboard() {
  // Guards ensure user is authenticated and has active org
  await requireAuth();
  await requireActiveOrg();

  const user = await requireAuth();
  const rbacContext = await getRBACContext();
  const organization = await getActiveOrganization();

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user.email || "Usuario"}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-medium mb-4">Información de sesión</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>UID:</strong> {user.uid}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Email verificado:</strong>{" "}
              {user.email_verified ? "Sí" : "No"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-medium mb-4">RBAC Context</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Rol:</strong> {rbacContext.role || "N/A"}
            </p>
            <p>
              <strong>Organización:</strong> {organization?.name || "N/A"}
            </p>
            <p>
              <strong>Org ID:</strong> {rbacContext.organizationId || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


