import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход в админку — Avicenna" },
      {
        name: "description",
        content: "Вход для администраторов сайта медицинского центра Avicenna.",
      },
      { property: "og:title", content: "Вход в админку — Avicenna" },
      {
        property: "og:description",
        content: "Авторизация администратора медицинского центра Avicenna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (mode: "signin" | "signup") => {
    setLoading(true);
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setLoading(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    if (result.data.session) {
      navigate({ to: "/admin/hero" });
    } else {
      toast.success("Проверьте почту, чтобы подтвердить регистрацию.");
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Не удалось войти через Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin/hero" });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-5">
      <Toaster />
      <div className="border-border w-full max-w-sm rounded-2xl border p-8">
        <h1 className="text-foreground text-2xl font-semibold">Вход администратора</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Управление слайдами Hero-баннера
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            className="bg-brand-green text-brand-white w-full hover:brightness-110"
            disabled={loading}
            onClick={() => submit("signin")}
          >
            Войти
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={() => submit("signup")}
          >
            Зарегистрироваться
          </Button>
          <Button variant="ghost" className="w-full" onClick={google}>
            Войти через Google
          </Button>
        </div>
      </div>
    </div>
  );
}
