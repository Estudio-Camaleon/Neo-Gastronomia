// app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <LoginForm />
      </div>
    </div>
  );
}
