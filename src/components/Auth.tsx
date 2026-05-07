import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "motion/react";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // User confirmed email confirmation is disabled, so they might be logged in directly 
        // or just told success.
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "Қате орын алды");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 brutalist-card"
      >
        <span className="bg-yellow-300 px-2 py-1 border-2 border-ink font-black text-[10px] uppercase block w-fit mb-4 mx-auto">
          {isSignUp ? "Тіркелу" : "Кіру"}
        </span>
        <h2 className="text-3xl font-black text-ink mb-2 text-center uppercase tracking-tighter italic">
          {isSignUp ? "Болашақты баста" : "Қош келдіңіз"}
        </h2>
        <p className="text-slate-500 text-center mb-8 font-bold text-sm uppercase">
          {isSignUp ? "Мансап көпірі сені күтеді" : "Жолыңызды жалғастырыңыз"}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-ink uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full brutalist-input"
              placeholder="example@mail.kz"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-ink uppercase mb-1">Құпия сөз</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutalist-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-dark text-white font-black py-4 border-2 border-ink shadow-[6px_6px_0px_#141414] uppercase tracking-widest active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />)}
            {isSignUp ? "Тіркелу" : "Кіру →"}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t-2 border-ink/10">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent font-black uppercase text-[10px] tracking-widest hover:underline transition-all"
          >
            {isSignUp ? "Кіру" : "Аккаунт ашу"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
