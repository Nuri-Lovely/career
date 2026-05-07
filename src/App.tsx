import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import { ChecklistItem } from "./components/ChecklistItem";
import { generateCareerBridge } from "./services/geminiService";
import { Subject, Career, BridgeResult, Portfolio } from "./types";
import { cn } from "./lib/utils";
import { 
  BookOpen, Palette, Globe, Code, History, Dna, Activity, Sigma, 
  Gamepad2, Music, Camera, PenTool, Rocket, Loader2, Sparkles,
  ChevronRight, ArrowLeft, LogOut, Map, PlayCircle, Lightbulb,
  User, Briefcase, Plus, ExternalLink, Trash2, Heart, Brain, Zap, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ICON_MAP: Record<string, any> = {
  Sigma, Palette, Globe, Code, History, Dna, BookOpen, Activity
};

const HOBBIES = [
  { id: "gaming", name_kk: "Ойын ойнау", icon: Gamepad2 },
  { id: "music", name_kk: "Музыка", icon: Music },
  { id: "photography", name_kk: "Фотосурет", icon: Camera },
  { id: "writing", name_kk: "Жазу", icon: PenTool },
  { id: "sports", name_kk: "Спорт", icon: Rocket }
];

const TRAITS = [
  { id: "analytical", name_kk: "Аналитикалық", icon: Brain, question: "Сіз мәселені шешкенде қалай әрекет етесіз?", options: [{l: "Логика мен деректерге сүйенемін", v: "analytical"}, {l: "Сезіміме сенемін", v: "empathetic"}] },
  { id: "creative", name_kk: "Шығармашылық", icon: Palette, question: "Шығармашылық жұмыс сізге ұнай ма?", options: [{l: "Иә, ерекше нәрсе жасағанды ұнатамын", v: "creative"}, {l: "Жоқ, нақты нұсқаулықтарды қалаймын", v: "analytical"}] },
  { id: "leader", name_kk: "Көшбасшылық", icon: Target, question: "Топта жұмыс істегенде сіздің рөліңіз?", options: [{l: "Жауапкершілікті өз мойныма аламын", v: "leader"}, {l: "Басқаларға көмектескенді қалаймын", v: "empathetic"}] },
];

const QUESTIONS = [
  { id: "q1", text: "Сіз бос уақытыңызда немен айналысқанды ұнатасыз?", options: [{l: "Техникалық құрылғыларды зерттеу", t: "analytical"}, {l: "Сурет салу немесе дизайн жасау", t: "creative"}] },
  { id: "q2", text: "Адамдармен қарым-қатынаста сіз үшін не маңызды?", options: [{l: "Тәртіп пен тиімділік", t: "leader"}, {l: "Түсіністік пен қолдау", t: "empathetic"}] }
];

type View = "builder" | "history" | "portfolio";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("builder");
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [history, setHistory] = useState<BridgeResult[]>([]);
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [testScore, setTestScore] = useState<Record<string, number>>({});
  
  const [bridgeResult, setBridgeResult] = useState<Partial<BridgeResult> | null>(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Subject, 2: Test, 3: Hobby, 4: Result

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchAppData();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAppData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppData = async () => {
    const [subData, carData, portData, histData] = await Promise.all([
      supabase.from("subjects").select("*"),
      supabase.from("career_library").select("*"),
      supabase.from("portfolios").select("*").order('created_at', { ascending: false }),
      supabase.from("user_results").select("*").order('created_at', { ascending: false })
    ]);
    
    if (subData.data && subData.data.length > 0) setSubjects(subData.data);
    else setSubjects([
      { id: "1", name_kk: "Математика", description_kk: "", icon: "Sigma", category: "Science" },
      { id: "2", name_kk: "Көркем еңбек", description_kk: "", icon: "Palette", category: "Art" },
      { id: "3", name_kk: "География", description_kk: "", icon: "Globe", category: "Social" },
      { id: "4", name_kk: "Информатика", description_kk: "", icon: "Code", category: "Tech" },
      { id: "5", name_kk: "Тарих", description_kk: "", icon: "History", category: "Social" },
      { id: "6", name_kk: "Физика", description_kk: "", icon: "Dna", category: "Science" },
      { id: "7", name_kk: "Әдебиет", description_kk: "", icon: "BookOpen", category: "Art" },
      { id: "8", name_kk: "Биология", description_kk: "", icon: "Activity", category: "Science" }
    ]);

    if (carData.data && carData.data.length > 0) setCareers(carData.data);
    else setCareers([
      { id: "c1111111-1111-1111-1111-111111111111", title_kk: "Data Visualizer", summary_kk: "Деректерді әдемі графикаға айналдырушы маман.", technical_skills: ["Python", "D3.js"], soft_skills: ["Logic"] },
      { id: "c2222222-2222-2222-2222-222222222222", title_kk: "UX Designer", summary_kk: "Пайдаланушыларға ыңғайлы цифрлық өнімдерді жасаушы.", technical_skills: ["Figma"], soft_skills: ["Empathy"] },
      { id: "c3333333-3333-3333-3333-333333333333", title_kk: "Urban Planner", summary_kk: "Болашақтың ақылды қалаларын жоспарлаушы.", technical_skills: ["GIS"], soft_skills: ["Strategic Thinking"] }
    ]);
    
    if (portData.data) setPortfolio(portData.data);
    if (histData.data) setHistory(histData.data);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleAnswer = (trait: string) => {
    setTestScore(prev => ({ ...prev, [trait]: (prev[trait] || 0) + 1 }));
    // Automatically select top traits after questions
    const sorted = Object.entries({ ...testScore, [trait]: (testScore[trait] || 0) + 1 })
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 2)
      .map(([id]) => id);
    setSelectedTraits(sorted);
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length !== 3 || !selectedHobby) return;
    
    setProcessing(true);
    try {
      const subjectNames = selectedSubjects.map(id => subjects.find(s => s.id === id)?.name_kk || "");
      const hobbyName = HOBBIES.find(h => h.id === selectedHobby)?.name_kk || "";
      const traitNames = selectedTraits.map(id => TRAITS.find(t => t.id === id)?.name_kk || "");
      
      const result = await generateCareerBridge(subjectNames, hobbyName, traitNames, careers);
      
      // Ensure we find the career by ID or fallback
      const result_career_id = result.career_id;
      const selectedCareer = careers.find(c => c.id === result_career_id) || careers[0];
      const fullResult = { 
        ...result, 
        career: selectedCareer,
        selected_subjects: subjectNames,
        selected_hobby: hobbyName,
        selected_traits: traitNames
      };

      // Save to Supabase
      const insertData: any = {
        user_id: session.user.id,
        selected_subjects: subjectNames,
        selected_hobby: hobbyName,
        selected_traits: traitNames,
        ai_explanation: result.ai_explanation,
        ai_roadmap: result.ai_roadmap,
        ai_simulation: result.ai_simulation,
        ai_project_starter: result.ai_project_starter
      };

      // Only add career_id if it's a real UUID (not starting with 'c' fallback)
      if (selectedCareer.id && !selectedCareer.id.startsWith('c')) {
        insertData.career_id = selectedCareer.id;
      }

      const { data, error } = await supabase.from("user_results").insert(insertData).select();

      if (error) throw error;
      
      setBridgeResult(fullResult);
      setHistory(prev => [data[0], ...prev]);
      setStep(4);
    } catch (error) {
      console.error(error);
      alert("Мәліметтерді өңдеу кезінде қате шықты. Қайталап көріңіз.");
    } finally {
      setProcessing(false);
    }
  };

  const addPortfolioProject = async (title: string, description: string, type: string = "Өз жобам") => {
    const { data, error } = await supabase.from("portfolios").insert({
      user_id: session.user.id,
      title,
      description,
      project_type: type
    }).select();

    if (!error && data) {
      setPortfolio(prev => [data[0], ...prev]);
      alert("Проект портфолиоға сақталды!");
    }
  };

  const deletePortfolioItem = async (id: string) => {
    const { error } = await supabase.from("portfolios").delete().eq('id', id);
    if (!error) setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  const handleSignOut = () => supabase.auth.signOut();

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-bone text-ink font-sans flex flex-col border-8 border-ink overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-20 bg-white border-b-4 border-ink flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-full border-2 border-ink flex items-center justify-center font-black text-white text-2xl italic tracking-tighter">Н</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter hidden sm:block">Career Evolution</h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 font-black uppercase text-[10px] tracking-widest">
          <button 
            onClick={() => setCurrentView("builder")}
            className={cn("hover:underline decoration-2 underline-offset-4", currentView === "builder" && "text-accent underline")}
          >
            Көпір Құру
          </button>
          <button 
            onClick={() => setCurrentView("history")}
            className={cn("hover:underline decoration-2 underline-offset-4", currentView === "history" && "text-accent underline")}
          >
            Менің Жолым
          </button>
          <button 
            onClick={() => setCurrentView("portfolio")}
            className={cn("hover:underline decoration-2 underline-offset-4", currentView === "portfolio" && "text-accent underline")}
          >
            Портфолио
          </button>
        </div>

        <nav className="flex gap-4 font-black uppercase text-[10px] tracking-widest items-center">
          <button onClick={handleSignOut} className="brutalist-button bg-red-50 text-red-600 border-red-600 shadow-[3px_3px_0px_#dc2626]">
            Шығу
          </button>
        </nav>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {currentView === "builder" && (
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col lg:flex-row gap-12"
              >
                <div className="lg:w-1/3 space-y-8">
                  <div>
                    <span className="bg-yellow-300 px-3 py-1 border-2 border-ink font-black text-xs uppercase inline-block">Қадам 01</span>
                    <h2 className="text-5xl font-black mt-4 leading-[0.9] uppercase tracking-tighter italic">Қызығушылық</h2>
                    <p className="text-lg font-bold opacity-70 mt-6 leading-relaxed">
                      Өзіңіздің ең жақсы көретін 3 пәніңізді таңдаңыз.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedSubjects.length !== 3}
                    className={cn(
                      "w-full p-6 border-4 border-ink font-black text-xl uppercase tracking-widest transition-all",
                      selectedSubjects.length === 3 ? "bg-primary-dark text-white shadow-[8px_8px_0px_#141414]" : "bg-slate-200 text-slate-400"
                    )}
                  >
                    Келесі →
                  </button>
                </div>
                <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {subjects.map(subject => (
                    <ChecklistItem
                      key={subject.id}
                      id={subject.id}
                      label={subject.name_kk}
                      icon={ICON_MAP[subject.icon] || BookOpen}
                      selected={selectedSubjects.includes(subject.id)}
                      disabled={selectedSubjects.length >= 3 && !selectedSubjects.includes(subject.id)}
                      onClick={() => toggleSubject(subject.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                <div className="text-center">
                   <h2 className="text-5xl font-black uppercase italic tracking-tighter">Психологиялық тест</h2>
                   <p className="text-lg font-bold opacity-60 mt-4">Сіздің тұлғалық қасиеттеріңізді анықтауға көмектесетін сұрақтарға жауап беріңіз.</p>
                </div>
                
                <div className="space-y-8">
                  {QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_#141414]">
                      <p className="text-xl font-black mb-6 italic">{idx + 1}. {q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <button 
                            key={oIdx}
                            onClick={() => handleAnswer(opt.t)}
                            className={cn(
                              "p-4 border-2 border-ink font-bold text-sm text-left hover:bg-slate-50 transition-all",
                              testScore[opt.t] > 0 && "border-accent bg-accent/5"
                            )}
                          >
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setStep(3)}
                    className="brutalist-button bg-primary-dark text-white px-12 py-4"
                  >
                    Жалғастыру →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col lg:flex-row gap-12"
              >
                <div className="lg:w-1/3 space-y-8">
                  <button onClick={() => setStep(2)} className="text-xs font-black uppercase text-slate-400 hover:text-ink flex items-center gap-1">
                    <ArrowLeft size={14} /> Кері: Тест
                  </button>
                  <div>
                    <h2 className="text-5xl font-black mt-4 leading-[0.9] uppercase tracking-tighter italic">Сүйікті ісіңіз</h2>
                    <p className="text-lg font-bold opacity-70 mt-6 leading-relaxed">
                      Бос уақытыңызда немен айналысқанды жақсы көресіз?
                    </p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedHobby || processing}
                    className={cn(
                      "w-full p-6 border-4 border-ink font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-4",
                      selectedHobby ? "bg-primary-dark text-white shadow-[8px_8px_0px_#141414]" : "bg-slate-200 text-slate-400"
                    )}
                  >
                    {processing ? <Loader2 className="animate-spin" /> : "Көпірді Салу →"}
                  </button>
                </div>
                <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {HOBBIES.map(hobby => (
                    <ChecklistItem
                      key={hobby.id}
                      id={hobby.id}
                      label={hobby.name_kk}
                      icon={hobby.icon}
                      selected={selectedHobby === hobby.id}
                      disabled={selectedHobby !== null && selectedHobby !== hobby.id}
                      onClick={() => setSelectedHobby(hobby.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && bridgeResult && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <button onClick={() => setStep(1)} className="brutalist-button">
                  <ArrowLeft size={18} className="inline mr-2" /> Басына қайту
                </button>
                
                {/* Same Result View as before but styled consistent */}
                <div className="bg-blue-50 brutalist-card p-10 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent opacity-10 border-b-4 border-l-4 border-ink rounded-bl-full" />
                  
                  <div className="w-full md:w-2/5 flex flex-col items-center md:items-start text-center md:text-left">
                     <span className="bg-primary-dark text-white px-3 py-1 border-2 border-ink font-black text-xs uppercase mb-4">Ұсыныс</span>
                     <h2 className="text-6xl font-black text-ink leading-none italic uppercase tracking-tighter">
                       {bridgeResult.career?.title_kk}
                     </h2>
                  </div>

                  <div className="w-full md:w-3/5 space-y-8 relative z-10">
                    <div className="p-8 bg-white border-4 border-ink shadow-[8px_8px_0px_#141414]">
                      <p className="text-2xl font-black italic leading-tight text-ink">
                        " {bridgeResult.ai_explanation} "
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Roadmap */}
                   <div className="bg-white p-8 border-4 border-ink shadow-[8px_8px_0px_#141414] relative">
                    <div className="absolute -top-4 -right-4 bg-yellow-300 border-2 border-ink px-4 py-1 font-black text-xs uppercase">Жоспар</div>
                    <div className="space-y-6">
                      {bridgeResult.ai_roadmap && Object.entries(bridgeResult.ai_roadmap).map(([key, st]: [string, any], i) => (
                        <div key={key} className="border-b-2 border-ink/5 pb-4">
                          <p className="text-[10px] font-black text-accent uppercase mb-1">{st.title}</p>
                          <p className="text-sm font-bold opacity-80">{st.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulator */}
                  <div className="bg-white p-8 border-4 border-ink shadow-[8px_8px_0px_#141414] relative">
                    <div className="absolute -top-4 -right-4 bg-accent text-white border-2 border-ink px-4 py-1 font-black text-xs uppercase">Симулятор</div>
                    <p className="text-sm font-black italic mb-6 leading-tight">{bridgeResult.ai_simulation?.question}</p>
                    <div className="space-y-2">
                       {bridgeResult.ai_simulation?.options.map((o: any, i: number) => (
                         <button key={i} onClick={() => alert(o.outcome)} className="w-full text-left p-3 border-2 border-ink text-xs font-bold hover:bg-slate-50">
                           {o.label}: {o.description}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Project & Save */}
                  <div className="bg-primary-dark p-8 border-4 border-ink shadow-[8px_8px_0px_#141414] text-white">
                    <h3 className="font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                      <Lightbulb size={16} /> Алғашқы жоба
                    </h3>
                    <p className="text-sm font-bold italic opacity-90 mb-8">{bridgeResult.ai_project_starter}</p>
                    <button 
                      onClick={() => addPortfolioProject(bridgeResult.career!.title_kk, bridgeResult.ai_project_starter!, "AI Ұсынысы")}
                      className="w-full bg-white text-ink font-black py-3 border-2 border-ink shadow-[4px_4px_0px_#141414] hover:shadow-none transition-all uppercase text-[10px]"
                    >
                      Портфолиоға қосу +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {currentView === "history" && (
          <div className="space-y-12">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">Менің Сақтаған Жолдарым</h2>
            {history.length === 0 ? (
              <div className="p-12 bg-white border-4 border-ink text-center opacity-40 font-black uppercase text-xl italic">
                Әлі ештеңе сақталмады
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {history.map((h: any) => (
                  <div key={h.id} className="bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_#141414] hover:translate-x-[2px] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-accent text-white px-2 py-1 text-[10px] font-black uppercase border-2 border-ink">Сақталған</span>
                      <span className="text-[10px] font-bold opacity-30">{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic leading-none">{careers.find(c => c.id === h.career_id)?.title_kk || "Мансап"}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {h.selected_subjects?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-slate-50 border border-ink/10 text-[9px] font-bold uppercase">{s}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        setBridgeResult({
                          ...h,
                          career: careers.find(c => c.id === h.career_id)
                        });
                        setStep(4);
                        setCurrentView("builder");
                      }}
                      className="text-xs font-black uppercase hover:underline text-accent"
                    >
                      Толығырақ көру →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "portfolio" && (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
               <h2 className="text-5xl font-black uppercase italic tracking-tighter">Портфолио</h2>
               <p className="text-right text-[10px] font-black uppercase opacity-40">Сенің жетістіктерің жинағы</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Add New Custom Project */}
              <div className="bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_#141414] flex flex-col justify-center gap-4 group">
                <h3 className="font-black uppercase text-xs mb-4 text-accent">Жаңа жоба қосу</h3>
                <input 
                  id="new-project-title"
                  placeholder="Жоба атауы" 
                  className="w-full p-2 border-2 border-ink font-bold text-xs outline-none focus:border-accent"
                />
                <textarea 
                  id="new-project-desc"
                  placeholder="Сипаттамасы" 
                  className="w-full p-2 border-2 border-ink font-bold text-xs h-24 outline-none focus:border-accent"
                />
                <button 
                  onClick={() => {
                    const t = document.getElementById('new-project-title') as HTMLInputElement;
                    const d = document.getElementById('new-project-desc') as HTMLTextAreaElement;
                    if (t.value && d.value) {
                      addPortfolioProject(t.value, d.value);
                      t.value = '';
                      d.value = '';
                    } else {
                      alert("Барлық жолақты толтырыңыз");
                    }
                  }}
                  className="w-full bg-ink text-white font-black py-2 text-xs uppercase"
                >
                  Қосу +
                </button>
              </div>

              {portfolio.map(p => (
                <div key={p.id} className="bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_#141414] flex flex-col">
                  <div className="flex justify-between mb-4">
                    <span className="bg-yellow-300 border-2 border-ink px-2 py-1 text-[10px] font-black uppercase">{p.project_type}</span>
                    <button onClick={() => deletePortfolioItem(p.id)} className="text-red-500 hover:scale-110 transition-transform">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic leading-tight">{p.title}</h3>
                  <p className="text-xs font-bold opacity-60 leading-relaxed mb-8 flex-grow italic">"{p.description}"</p>
                  <button className="brutalist-button w-full flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Ашу
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t-4 border-ink p-12 bg-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-white font-black text-sm">N</div>
          <span className="font-black uppercase text-xs italic tracking-tighter">Nurai Evolution</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">© 2026 Дағдыдан мансапқа дейінгі көпір</p>
        <div className="flex gap-4 font-black uppercase text-[10px]">
          <a href="#" className="hover:underline">Құпиялылық</a>
          <a href="#" className="hover:underline">Шарттар</a>
        </div>
      </footer>
    </div>
  );
}
