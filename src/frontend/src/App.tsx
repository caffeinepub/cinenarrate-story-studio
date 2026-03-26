import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BookOpen,
  Film,
  Loader2,
  LogIn,
  LogOut,
  User,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CreatePage from "./pages/CreatePage";
import LibraryPage from "./pages/LibraryPage";

const queryClient = new QueryClient();

type Tab = "create" | "library";

function NavBar({
  activeTab,
  setActiveTab,
}: { activeTab: Tab; setActiveTab: (t: Tab) => void }) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();
  const shortId = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{
        background: "oklch(0.085 0.008 260 / 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center animate-pulse-glow"
            style={{ background: "oklch(0.74 0.17 278)" }}
          >
            <Film
              className="w-4 h-4"
              style={{ color: "oklch(0.085 0.008 260)" }}
            />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            CineNarrate
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <button
            type="button"
            data-ocid="nav.tab"
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "create"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> Create
          </button>
          <button
            type="button"
            data-ocid="nav.tab"
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "library"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Library
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {identity ? (
            <>
              <Avatar
                className="w-7 h-7 cursor-pointer"
                title={principal ?? ""}
              >
                <AvatarFallback
                  className="text-xs"
                  style={{ background: "oklch(0.74 0.17 278 / 0.2)" }}
                >
                  <User className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              {shortId && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {shortId}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={clear}
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button
              data-ocid="nav.primary_button"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={login}
              disabled={isLoggingIn}
              style={{
                background: "oklch(0.74 0.17 278)",
                color: "oklch(0.085 0.008 260)",
              }}
            >
              {isLoggingIn ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LogIn className="w-3 h-3" />
              )}
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("create");

  return (
    <div className="min-h-screen">
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "create" ? <CreatePage /> : <LibraryPage />}
        </motion.div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster richColors theme="dark" />
    </QueryClientProvider>
  );
}
