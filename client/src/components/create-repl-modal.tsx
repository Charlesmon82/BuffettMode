import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Code2, Globe, Box, Terminal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const languages = [
  { id: "python", name: "Python", icon: "🐍", color: "text-blue-400", desc: "General purpose, data science, AI" },
  { id: "node", name: "Node.js", icon: "🟢", color: "text-green-500", desc: "JavaScript runtime for backend" },
  { id: "html", name: "HTML, CSS, JS", icon: "🌐", color: "text-orange-500", desc: "Static web development" },
  { id: "react", name: "React", icon: "⚛️", color: "text-cyan-400", desc: "Interactive UI library" },
  { id: "cplusplus", name: "C++", icon: "🔵", color: "text-blue-600", desc: "Systems programming" },
  { id: "java", name: "Java", icon: "☕", color: "text-red-500", desc: "Enterprise applications" },
  { id: "go", name: "Go", icon: "🐹", color: "text-cyan-500", desc: "Scalable systems" },
  { id: "rust", name: "Rust", icon: "🦀", color: "text-orange-600", desc: "Performance and safety" },
];

export function CreateReplModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLangs = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#1c1f26] border-[#2b3240] text-foreground p-0 gap-0 overflow-hidden shadow-2xl">
        <div className="flex h-[500px]">
          {/* Sidebar - Templates */}
          <div className="w-64 border-r border-[#2b3240] bg-[#15181e] p-4 flex flex-col gap-2">
             <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Templates</div>
             <Button variant="ghost" className="justify-start bg-[#2b3240]/50 text-white w-full"><Box className="mr-2 h-4 w-4" /> All Templates</Button>
             <Button variant="ghost" className="justify-start text-muted-foreground hover:text-white w-full"><Globe className="mr-2 h-4 w-4" /> Web Development</Button>
             <Button variant="ghost" className="justify-start text-muted-foreground hover:text-white w-full"><Terminal className="mr-2 h-4 w-4" /> Systems</Button>
             <Button variant="ghost" className="justify-start text-muted-foreground hover:text-white w-full"><Code2 className="mr-2 h-4 w-4" /> Data Science</Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[#1c1f26]">
            <DialogHeader className="p-6 border-b border-[#2b3240]">
              <DialogTitle className="text-xl font-medium">Create a new Repl</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Start building with a template or import from GitHub.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search templates..." 
                  className="pl-9 bg-[#0e1116] border-[#2b3240] focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredLangs.map((lang) => (
                  <motion.div
                    key={lang.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLang(lang.id)}
                    className={cn(
                      "cursor-pointer p-3 rounded-lg border flex items-start gap-3 transition-colors",
                      selectedLang === lang.id
                        ? "bg-primary/10 border-primary ring-1 ring-primary"
                        : "bg-[#15181e] border-[#2b3240] hover:border-primary/50"
                    )}
                  >
                    <div className="text-2xl">{lang.icon}</div>
                    <div>
                      <div className="font-medium text-sm text-white">{lang.name}</div>
                      <div className="text-xs text-muted-foreground leading-tight mt-1">{lang.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <DialogFooter className="p-4 border-t border-[#2b3240] bg-[#15181e] flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                 {selectedLang && (
                   <span className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                     Selected: <span className="font-medium text-white">{languages.find(l => l.id === selectedLang)?.name}</span>
                   </span>
                 )}
              </div>
              <Button disabled={!selectedLang} className="bg-primary hover:bg-primary/90 text-white font-medium px-8">
                Create Repl
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
