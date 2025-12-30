"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

export default function SelectOrgPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user organizations
    fetch("/api/auth/organizations")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrganizations(data.organizations || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching organizations:", err);
        setError("Error al cargar organizaciones");
        setLoading(false);
      });
  }, []);

  const handleSelect = async (organizationId: string) => {
    setSelecting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/select-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization_id: organizationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al seleccionar organización");
      }

      // Redirect to admin
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Error selecting organization:", err);
      setError(
        err instanceof Error ? err.message : "Error al seleccionar organización"
      );
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando organizaciones...</p>
      </div>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="mt-4"
            variant="outline"
          >
            Volver al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Selecciona una organización</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tienes acceso a múltiples organizaciones. Selecciona una para continuar.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {organizations.map((org) => (
            <Button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              disabled={selecting}
              className="w-full justify-start"
              variant="outline"
            >
              {org.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

