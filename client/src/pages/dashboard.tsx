import { useState } from "react";
import { CreateReplModal } from "@/components/create-repl-modal";
import { Button } from "@/components/ui/button";
import { Plus, Search, LayoutGrid, List, Folder, MoreHorizontal, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal for demonstration if query param exists or just for effect
  // useEffect(() => setIsModalOpen(true), []); 

  const recentRepls = [
    { title: "python-data-analysis", lang: "Python", time: "2 hours ago", icon: "🐍" },
    { title: "react-dashboard-mockup", lang: "React", time: "Yesterday", icon: "⚛️" },
    { title: "express-api-server", lang: "Node.js", time: "3 days ago", icon: "🟢" },
    { title: "portfolio-site-v2", lang: "HTML/CSS", time: "1 week ago", icon: "🌐" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-[#15181e] hidden md:flex flex-col">
        <div className="p-6">
          <div className="text-xl font-bold tracking-tight flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-mono font-bold">{`{}`}</div>
             Replit
          </div>
        </div>

        <div className="px-3 py-2 space-y-1">
          <Button variant="secondary" className="w-full justify-start font-medium text-white bg-[#2b3240]/50"><LayoutGrid className="mr-2 h-4 w-4" /> Home</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white"><Folder className="mr-2 h-4 w-4" /> My Repls</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white"><Star className="mr-2 h-4 w-4" /> Favorites</Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white"><Clock className="mr-2 h-4 w-4" /> Recent</Button>
        </div>

        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">Demo User</div>
              <div className="text-xs text-muted-foreground truncate">Hacker Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-[#1c1f26]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span className="hover:text-white cursor-pointer transition-colors">Home</span>
             <span>/</span>
             <span className="text-white font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> Create Repl
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 flex-1 bg-[#0e1116]">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <section>
              <h2 className="text-lg font-semibold mb-4 text-white">Recent Repls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentRepls.map((repl, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-4 rounded-xl border border-border bg-[#1c1f26] hover:border-primary/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-black/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl p-2 bg-[#2b3240]/50 rounded-lg group-hover:scale-110 transition-transform">{repl.icon}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                    <div className="font-medium text-white mb-1 truncate">{repl.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{repl.lang}</span>
                      <span>•</span>
                      <span>{repl.time}</span>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add New Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setIsModalOpen(true)}
                  className="p-4 rounded-xl border border-dashed border-border bg-transparent hover:bg-[#1c1f26] hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary gap-3 min-h-[140px]"
                >
                  <div className="p-3 rounded-full bg-[#2b3240] group-hover:bg-primary/20">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="font-medium">Create new Repl</span>
                </motion.div>
              </div>
            </section>

            <section className="pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Your Folders</h2>
                <Button variant="link" className="text-primary h-auto p-0">View all</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["University Projects", "Side Hustles", "Experiments"].map((folder, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-[#1c1f26] hover:bg-[#2b3240] transition-colors cursor-pointer">
                    <Folder className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">{folder}</span>
                    <span className="ml-auto text-xs text-muted-foreground">3 items</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      <CreateReplModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
