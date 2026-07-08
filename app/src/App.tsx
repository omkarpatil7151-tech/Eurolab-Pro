import { useState } from "react";
import { LoginScreen } from "@/features/auth/LoginScreen";
import { AppShell } from "@/layouts/AppShell";

export function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  if (!isSignedIn) {
    return <LoginScreen onSignIn={() => setIsSignedIn(true)} />;
  }

  return <AppShell onSignOut={() => setIsSignedIn(false)} />;
}
