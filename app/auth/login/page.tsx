"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      // 2. Obtener idToken
      const idToken = await userCredential.user.getIdToken();

      // 3. Crear session cookie llamando al endpoint
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      // 4. Bootstrap user (create app.users record if needed)
      const bootstrapResponse = await fetch("/api/auth/bootstrap", {
        method: "POST",
      });

      if (!bootstrapResponse.ok) {
        throw new Error("Failed to bootstrap user");
      }

      const bootstrapData = await bootstrapResponse.json();

      // 5. Get user organizations to determine redirect
      const orgsResponse = await fetch("/api/auth/organizations");
      const orgsData = await orgsResponse.json();
      const orgCount = orgsData.organizations?.length || 0;

      // 6. Redirect based on organization count
      if (orgCount === 0) {
        // Should not happen if bootstrap worked, but handle it
        throw new Error("No organizations found");
      } else if (orgCount === 1) {
        // Auto-select single organization
        const orgId = orgsData.organizations[0].id;
        await fetch("/api/auth/select-org", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organization_id: orgId }),
        });
        // Redirect to original destination or /admin
        const from = searchParams.get("from") || "/admin";
        router.push(from);
      } else {
        // Multiple organizations - show selector
        router.push("/select-org");
      }
      router.refresh();
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        // Errores comunes de Firebase Auth
        if (err.message.includes("auth/invalid-email")) {
          setError("Email inválido");
        } else if (err.message.includes("auth/user-not-found")) {
          setError("Usuario no encontrado");
        } else if (err.message.includes("auth/wrong-password")) {
          setError("Contraseña incorrecta");
        } else if (err.message.includes("auth/invalid-credential")) {
          setError("Credenciales inválidas");
        } else {
          setError(err.message || "Error al iniciar sesión");
        }
      } else {
        setError("Error desconocido al iniciar sesión");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-medium">XTG SaaS Platform</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}

