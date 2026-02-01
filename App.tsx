import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import {
  analyzeLocation,
  checkSearchLimit,
  incrementSearchCount,
  getRemainingSearches,
  resetSearchCount,
} from "./services/geminiService";
import { LocantInsight, SearchState, TimelineOption } from "./types";
import BentoGrid from "./components/BentoGrid";
import SkeletonLoader from "./components/SkeletonLoader";
import TimelineFilter from "./components/TimelineFilter";
import IntentEther from "./components/IntentEther";

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: "",
    isSearching: false,
    hasSearched: false,
    result: null,
    error: null,
    timeline: "30 Days",
  });

  const [remainingSearches, setRemainingSearches] = useState(3);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setRemainingSearches(getRemainingSearches());
  }, []);

  // Core search logic extracted for reusability
  const performSearch = useCallback(
    async (query: string, timeline: TimelineOption) => {
      if (!query.trim()) return;

      if (!checkSearchLimit()) {
        setState((prev) => ({ ...prev, error: "Demo limit reached." }));
        return;
      }

      // Blur background on search start
      setIsInputFocused(true);

      setState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
        hasSearched: true,
        result: null,
        timeline,
      }));

      try {
        const result = await analyzeLocation(query, timeline);
        incrementSearchCount();
        setRemainingSearches(getRemainingSearches());
        setState((prev) => ({
          ...prev,
          isSearching: false,
          result: result,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isSearching: false,
          hasSearched: false,
          error: err.message || "Failed to analyze location.",
        }));
      } finally {
        setIsInputFocused(false);
      }
    },
    [],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(state.query, state.timeline);
  };

  const handleTimelineChange = (timeline: TimelineOption) => {
    setState((prev) => ({ ...prev, timeline }));
    // Auto-trigger search if we already have a query and have searched before, or if user is just exploring filters on a typed query
    if (state.query.trim()) {
      performSearch(state.query, timeline);
    }
  };

  const resetSearch = () => {
    setState((prev) => ({
      ...prev,
      hasSearched: false,
      result: null,
      query: "",
      error: null,
    }));
  };

  const handleResetLimit = () => {
    resetSearchCount();
    setRemainingSearches(getRemainingSearches());
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <div className="min-h-screen w-full bg-white text-apple-text selection:bg-apple-blue/20 relative">
      {/* Background Layer - The Intent Ether */}
      {!state.hasSearched && <IntentEther isBlurred={isInputFocused} />}

      {/* Header/Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 border-b border-transparent">
        <div
          onClick={resetSearch}
          className="text-xl font-bold tracking-tight cursor-pointer flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-black rounded-full" />
          Locant
        </div>
        <div className="text-xs font-medium text-apple-subtext bg-apple-card px-3 py-1.5 rounded-full border border-apple-border">
          {remainingSearches} free searches left
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative w-full h-full flex flex-col pt-28 px-4 md:px-0 z-10">
        <AnimatePresence mode="wait">
          {!state.hasSearched ? (
            /* Landing State */
            <motion.div
              key="landing"
              className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, transition: { duration: 0.5 } }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 scale-110"
              >
                <TimelineFilter
                  selected={state.timeline}
                  onChange={handleTimelineChange}
                />
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-semibold text-center mb-6 tracking-tight drop-shadow-sm text-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
              >
                Reveal the Invisible Market.
              </motion.h1>
              <motion.p
                className="text-apple-subtext text-center mb-16 max-w-lg text-xl font-medium leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Find what the city needs before you build the solution.
              </motion.p>

              <form
                onSubmit={handleSearchSubmit}
                className="w-full relative group px-4 md:px-0"
              >
                <div className="relative flex items-center w-full">
                  <Search
                    className={`absolute left-6 w-6 h-6 transition-colors ${isInputFocused ? "text-apple-text" : "text-apple-subtext"}`}
                  />
                  <input
                    type="text"
                    value={state.query}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, query: e.target.value }))
                    }
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Enter City or Zip Code (e.g., Austin, 78701)"
                    className="w-full h-20 pl-16 pr-16 bg-white/90 backdrop-blur-2xl border border-apple-border rounded-full text-xl md:text-2xl shadow-hover outline-none focus:ring-4 focus:ring-apple-blue/10 transition-all placeholder:text-gray-300"
                    disabled={state.isSearching}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!state.query.trim() || state.isSearching}
                    className="absolute right-3 p-3.5 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors scale-110 mr-1"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
                {state.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-0 w-full flex items-center justify-center gap-2 text-red-500 text-base font-medium"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{state.error}</span>
                    {state.error.includes("limit") && (
                      <button
                        onClick={handleResetLimit}
                        className="flex items-center gap-1 ml-2 text-black underline hover:text-apple-blue transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Reset
                      </button>
                    )}
                  </motion.div>
                )}
              </form>
            </motion.div>
          ) : (
            /* Dashboard State */
            <motion.div
              key="dashboard"
              className="w-full bg-white pb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-full max-w-4xl mx-auto mb-10 px-4 flex flex-col md:flex-row md:items-end justify-between gap-6 sticky top-20 z-40 bg-white/80 backdrop-blur-xl py-4 -mx-4 md:mx-auto rounded-b-2xl">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-semibold tracking-tight text-black"
                  >
                    {state.result ? state.result.location : state.query}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-apple-subtext text-base mt-2"
                  >
                    Strategic Intelligence Report
                  </motion.p>
                </div>

                <div className="flex items-center gap-4">
                  <TimelineFilter
                    selected={state.timeline}
                    onChange={handleTimelineChange}
                    disabled={state.isSearching}
                  />
                  <button
                    onClick={resetSearch}
                    className="text-sm font-medium text-apple-blue hover:underline ml-2"
                  >
                    New Search
                  </button>
                </div>
              </div>

              {state.isSearching ? (
                <SkeletonLoader />
              ) : (
                state.result && <BentoGrid data={state.result} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Branding */}
      <footer className="fixed bottom-6 w-full text-center text-xs text-apple-subtext pointer-events-none z-20">
        Powered by Gemini Intelligence
      </footer>
    </div>
  );
};

export default App;
