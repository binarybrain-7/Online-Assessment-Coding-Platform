"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, Github, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { validateUsername, validateEmail, validatePassword } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const checkUsernameAvailability = async (inputName: string) => {
    const error = validateUsername(inputName);
    if (error) {
      setUsernameError(error);
      setUsernameAvailable(null);
      return;
    }

    setUsernameError(null);
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", inputName)
      .maybeSingle();

    if (data) {
      setUsernameError("Username is already taken");
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(true);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const uErr = validateUsername(username);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    if (uErr || eErr || pErr) {
      setErrorMessage(uErr || eErr || pErr);
      return;
    }

    if (usernameAvailable === false) {
      setErrorMessage("Please choose an available username.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "github" | "google") => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Code2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-xs text-slate-400">
            Join the competitive coding community today
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Input
              label="Unique Username"
              type="text"
              placeholder="coding_ninja"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                checkUsernameAvailability(e.target.value);
              }}
              error={usernameError ?? undefined}
              required
            />
            {usernameAvailable === true && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Username is available
              </span>
            )}
          </div>

          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="gradient" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 absolute">
            Or sign up with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignup("github")}
            className="w-full text-xs"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignup("google")}
            className="w-full text-xs"
          >
            <Mail className="w-4 h-4 mr-2" />
            Google
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
