import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  TrendingUp, 
  PieChart, 
  Building2, 
  Zap, 
  Heart, 
  Pill,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  Briefcase,
  Layers,
  RefreshCw,
  BookOpen,
  Calculator,
  Scale,
  Target,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Newspaper,
  ExternalLink,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StockAnalysis, SectorResult, PortfolioResult } from "@shared/schema";

interface ScanAllResult {
  total_stocks: number;
  summary: {
    buy: number;
    hold: number;
    avoid: number;
    incomplete: number;
  };
  top_10_by_margin_of_safety: StockAnalysis[];
  all_results: StockAnalysis[];
}

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  related: string;
}

const formatPercent = (val: number | null) => {
  if (val === null) return "—";
  return (val * 100).toFixed(1) + "%";
};

const formatCurrency = (val: number | null) => {
  if (val === null) return "—";
  return "$" + val.toFixed(2);
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "BUY": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "HOLD": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "AVOID": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case "BUY": return <CheckCircle2 className="h-4 w-4" />;
    case "HOLD": return <AlertTriangle className="h-4 w-4" />;
    case "AVOID": return <XCircle className="h-4 w-4" />;
    default: return <AlertTriangle className="h-4 w-4" />;
  }
};

const sectorIcons: Record<string, React.ReactNode> = {
  tech: <Zap className="h-5 w-5" />,
  energy: <TrendingUp className="h-5 w-5" />,
  finance: <Building2 className="h-5 w-5" />,
  consumer: <Heart className="h-5 w-5" />,
  healthcare: <Pill className="h-5 w-5" />,
  industrials: <Building2 className="h-5 w-5" />,
  materials: <Layers className="h-5 w-5" />,
  utilities: <Zap className="h-5 w-5" />,
  realestate: <Building2 className="h-5 w-5" />,
  communication: <BarChart3 className="h-5 w-5" />,
};

function getReasoningPoints(stock: StockAnalysis): { positive: string[]; negative: string[]; neutral: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];
  const neutral: string[] = [];

  // Margin of Safety analysis (primary rating factor)
  if (stock.Margin_of_Safety !== null) {
    if (stock.Margin_of_Safety > 0.3) {
      positive.push(`Trading ${formatPercent(stock.Margin_of_Safety)} below intrinsic value - significant discount`);
    } else if (stock.Margin_of_Safety > 0) {
      neutral.push(`Trading ${formatPercent(stock.Margin_of_Safety)} below intrinsic value - modest discount`);
    } else {
      negative.push(`Trading ${formatPercent(Math.abs(stock.Margin_of_Safety))} above intrinsic value - overvalued`);
    }
  }

  // Price vs Intrinsic Value
  if (stock.price !== null && stock.Intrinsic_Value !== null) {
    if (stock.price < stock.Intrinsic_Value * 0.7) {
      positive.push(`Current price ($${stock.price.toFixed(2)}) is well below fair value ($${stock.Intrinsic_Value.toFixed(2)})`);
    } else if (stock.price > stock.Intrinsic_Value) {
      negative.push(`Current price ($${stock.price.toFixed(2)}) exceeds fair value ($${stock.Intrinsic_Value.toFixed(2)})`);
    }
  }

  // ROE analysis
  if (stock.ROE !== null) {
    const roePercent = stock.ROE * 100;
    if (roePercent > 20) {
      positive.push(`Excellent ROE of ${roePercent.toFixed(1)}% - highly efficient use of equity`);
    } else if (roePercent > 15) {
      positive.push(`Good ROE of ${roePercent.toFixed(1)}% - solid returns for shareholders`);
    } else if (roePercent > 10) {
      neutral.push(`Average ROE of ${roePercent.toFixed(1)}% - acceptable returns`);
    } else if (roePercent > 0) {
      negative.push(`Low ROE of ${roePercent.toFixed(1)}% - poor capital efficiency`);
    } else {
      negative.push(`Negative ROE - company is losing money`);
    }
  }

  // ROIC analysis
  if (stock.ROIC !== null) {
    const roicPercent = stock.ROIC * 100;
    if (roicPercent > 15) {
      positive.push(`Strong ROIC of ${roicPercent.toFixed(1)}% - creating value from investments`);
    } else if (roicPercent > 10) {
      neutral.push(`Decent ROIC of ${roicPercent.toFixed(1)}% - reasonable investment returns`);
    } else if (roicPercent > 0) {
      negative.push(`Weak ROIC of ${roicPercent.toFixed(1)}% - poor investment returns`);
    }
  }

  // FCF Yield analysis
  if (stock.FCF_Yield !== null) {
    const fcfPercent = stock.FCF_Yield * 100;
    if (fcfPercent > 8) {
      positive.push(`High FCF Yield of ${fcfPercent.toFixed(1)}% - strong cash generation`);
    } else if (fcfPercent > 5) {
      positive.push(`Good FCF Yield of ${fcfPercent.toFixed(1)}% - healthy cash flow`);
    } else if (fcfPercent > 2) {
      neutral.push(`Moderate FCF Yield of ${fcfPercent.toFixed(1)}%`);
    } else if (fcfPercent > 0) {
      negative.push(`Low FCF Yield of ${fcfPercent.toFixed(1)}% - limited cash generation`);
    } else {
      negative.push(`Negative FCF - company is burning cash`);
    }
  }

  // Debt-to-Equity analysis
  if (stock.Debt_to_Equity !== null) {
    if (stock.Debt_to_Equity < 0.3) {
      positive.push(`Very low debt (D/E: ${stock.Debt_to_Equity.toFixed(2)}) - strong balance sheet`);
    } else if (stock.Debt_to_Equity < 0.5) {
      positive.push(`Low debt (D/E: ${stock.Debt_to_Equity.toFixed(2)}) - conservative financing`);
    } else if (stock.Debt_to_Equity < 1) {
      neutral.push(`Moderate debt (D/E: ${stock.Debt_to_Equity.toFixed(2)}) - manageable leverage`);
    } else if (stock.Debt_to_Equity < 2) {
      negative.push(`High debt (D/E: ${stock.Debt_to_Equity.toFixed(2)}) - elevated financial risk`);
    } else {
      negative.push(`Very high debt (D/E: ${stock.Debt_to_Equity.toFixed(2)}) - significant financial risk`);
    }
  }

  return { positive, negative, neutral };
}

function StockCard({ stock }: { stock: StockAnalysis }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reasoning = getReasoningPoints(stock);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-lg text-white">{stock.ticker}</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(stock.price)}</p>
        </div>
        <Badge className={cn("flex items-center gap-1", getRatingColor(stock.Rating))}>
          {getRatingIcon(stock.Rating)}
          {stock.Rating}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">ROE</span>
          <p className="font-medium text-white">{formatPercent(stock.ROE)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">ROIC</span>
          <p className="font-medium text-white">{formatPercent(stock.ROIC)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">FCF Yield</span>
          <p className="font-medium text-white">{formatPercent(stock.FCF_Yield)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">D/E Ratio</span>
          <p className="font-medium text-white">{stock.Debt_to_Equity?.toFixed(2) ?? "—"}</p>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-muted-foreground">Intrinsic Value</span>
          <p className="font-medium text-primary">{formatCurrency(stock.Intrinsic_Value)}</p>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">Margin of Safety</span>
          <p className={cn(
            "font-bold",
            stock.Margin_of_Safety && stock.Margin_of_Safety > 0 ? "text-green-400" : "text-red-400"
          )}>
            {formatPercent(stock.Margin_of_Safety)}
          </p>
        </div>
      </div>

      {/* Expandable Reasoning Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-3 pt-3 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
        data-testid={`button-expand-${stock.ticker}`}
      >
        <span>Why {stock.Rating}?</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Positive Factors */}
              {reasoning.positive.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                    <ThumbsUp className="h-3 w-3" />
                    STRENGTHS
                  </div>
                  {reasoning.positive.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                      <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-green-400/90">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Neutral Factors */}
              {reasoning.neutral.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium">
                    <Minus className="h-3 w-3" />
                    NEUTRAL
                  </div>
                  {reasoning.neutral.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                      <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-yellow-400/90">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Negative Factors */}
              {reasoning.negative.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                    <ThumbsDown className="h-3 w-3" />
                    CONCERNS
                  </div>
                  {reasoning.negative.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                      <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-red-400/90">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating Summary */}
              <div className={cn(
                "text-xs p-2 rounded-lg border",
                stock.Rating === "BUY" && "bg-green-500/10 border-green-500/30 text-green-400",
                stock.Rating === "HOLD" && "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                stock.Rating === "AVOID" && "bg-red-500/10 border-red-500/30 text-red-400",
                stock.Rating === "DATA_INCOMPLETE" && "bg-gray-500/10 border-gray-500/30 text-gray-400"
              )}>
                <strong>Conclusion:</strong>{" "}
                {stock.Rating === "BUY" && "Stock is significantly undervalued with a margin of safety above 30%."}
                {stock.Rating === "HOLD" && "Stock is slightly undervalued but doesn't meet the 30% margin of safety threshold."}
                {stock.Rating === "AVOID" && "Stock is trading at or above its intrinsic value - wait for a better entry point."}
                {stock.Rating === "DATA_INCOMPLETE" && "Insufficient financial data to make a recommendation."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StockScanner() {
  const [ticker, setTicker] = useState("");
  const [searchedTicker, setSearchedTicker] = useState("");
  
  const { data, isLoading, error } = useQuery<StockAnalysis>({
    queryKey: ["/api/scan", searchedTicker],
    queryFn: async () => {
      if (!searchedTicker) return null;
      const res = await fetch(`/api/scan/${searchedTicker}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!searchedTicker,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setSearchedTicker(ticker.trim().toUpperCase());
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter ticker symbol (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="pl-10 bg-card border-border font-mono"
            data-testid="input-ticker"
          />
        </div>
        <Button type="submit" disabled={isLoading} data-testid="button-scan">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
        </Button>
      </form>
      
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing {searchedTicker}...</span>
          </motion.div>
        )}
        
        {data && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md"
          >
            <StockCard stock={data} />
          </motion.div>
        )}
        
        {!data && !isLoading && !searchedTicker && (
          <motion.div
            key="empty"
            className="text-center py-12 text-muted-foreground"
          >
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Enter a stock ticker to analyze using Buffett-style metrics</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectorScreener() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  
  const { data: sectorsData } = useQuery<{ sectors: string[] }>({
    queryKey: ["/api/sectors"],
    queryFn: async () => {
      const res = await fetch("/api/sectors");
      return res.json();
    },
  });
  
  const { data: sectorResult, isLoading } = useQuery<SectorResult>({
    queryKey: ["/api/sector", selectedSector],
    queryFn: async () => {
      if (!selectedSector) return null;
      const res = await fetch(`/api/sector/${selectedSector}`);
      return res.json();
    },
    enabled: !!selectedSector,
  });
  
  const sectors = sectorsData?.sectors || ["tech", "energy", "finance", "consumer", "healthcare"];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {sectors.map((sector) => (
          <Button
            key={sector}
            variant={selectedSector === sector ? "default" : "outline"}
            onClick={() => setSelectedSector(sector)}
            className="capitalize"
            data-testid={`button-sector-${sector}`}
          >
            {sectorIcons[sector] || <Building2 className="h-5 w-5 mr-2" />}
            <span className="ml-2">{sector}</span>
          </Button>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Screening {selectedSector} sector...</span>
        </div>
      )}
      
      {sectorResult && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize">{sectorResult.sector} Sector</h3>
            <Badge variant="outline">{sectorResult.tickers.length} stocks</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorResult.all_results.map((stock, i) => (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StockCard stock={stock} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {!selectedSector && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a sector to screen stocks by margin of safety</p>
        </div>
      )}
    </div>
  );
}

function PortfolioBuilder() {
  const [capital, setCapital] = useState("10000");
  const [tickersInput, setTickersInput] = useState("AAPL, MSFT, GOOGL");
  
  const mutation = useMutation<PortfolioResult>({
    mutationFn: async () => {
      const tickers = tickersInput.split(",").map(t => t.trim().toUpperCase()).filter(Boolean);
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capital: parseFloat(capital),
          tickers,
        }),
      });
      if (!res.ok) throw new Error("Failed to build portfolio");
      return res.json();
    },
  });
  
  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleBuild} className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Investment Capital ($)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="10000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="pl-10 bg-card border-border"
              data-testid="input-capital"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Tickers (comma-separated)</label>
          <Input
            placeholder="AAPL, MSFT, GOOGL"
            value={tickersInput}
            onChange={(e) => setTickersInput(e.target.value.toUpperCase())}
            className="bg-card border-border font-mono"
            data-testid="input-portfolio-tickers"
          />
        </div>
        
        <Button type="submit" disabled={mutation.isPending} className="w-full" data-testid="button-build-portfolio">
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Building Portfolio...
            </>
          ) : (
            <>
              <Briefcase className="h-4 w-4 mr-2" />
              Build Portfolio
            </>
          )}
        </Button>
      </form>
      
      {mutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Portfolio Allocation</h3>
              <p className="text-sm text-muted-foreground capitalize">{mutation.data.strategy.replace(/_/g, " ")}</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              ${mutation.data.total_capital.toLocaleString()}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {mutation.data.allocations.map((alloc, i) => (
              <motion.div
                key={alloc.ticker}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-white">{alloc.ticker}</div>
                  <Badge className={getRatingColor(alloc.rating)}>{alloc.rating}</Badge>
                  {alloc.weight !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {(alloc.weight * 100).toFixed(1)}% weight
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${(alloc.allocated_cash ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {alloc.shares ?? 0} shares @ ${(alloc.price ?? 0).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {!mutation.data && !mutation.isPending && (
        <div className="text-center py-12 text-muted-foreground">
          <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter your capital and tickers to build a value-weighted portfolio</p>
        </div>
      )}
    </div>
  );
}

function Methodology() {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Warren Buffett's Value Investing Approach</h3>
            <p className="text-muted-foreground">
              This app uses fundamental analysis metrics championed by Warren Buffett to identify undervalued stocks. 
              The goal is to find companies with strong financials trading below their intrinsic (true) value.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics Explained */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Key Metrics Explained
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h4 className="font-bold text-white mb-2">ROE (Return on Equity)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Measures how efficiently a company uses shareholders' money to generate profits.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400">
                <strong>Good:</strong> Above 15% indicates the company is generating strong returns for shareholders.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h4 className="font-bold text-white mb-2">ROIC (Return on Invested Capital)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Shows how well the company invests its total capital (both debt and equity) to generate returns.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400">
                <strong>Good:</strong> Above 10% means the company is creating value from its investments.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h4 className="font-bold text-white mb-2">FCF Yield (Free Cash Flow Yield)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              The percentage of free cash flow relative to the company's market value. Higher is better.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400">
                <strong>Good:</strong> Above 5% suggests the stock may be undervalued relative to its cash generation.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h4 className="font-bold text-white mb-2">D/E Ratio (Debt-to-Equity)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Measures how much debt the company uses compared to shareholder equity. Lower means less financial risk.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                <strong>Ideal:</strong> Below 0.5 is excellent. Above 2.0 indicates high debt levels.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Intrinsic Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Intrinsic Value Calculation
        </h3>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            We calculate intrinsic value using a simplified Gordon Growth Model based on Earnings Per Share (EPS):
          </p>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm text-center mb-4">
            <span className="text-primary">Intrinsic Value</span> = (EPS × (1 + Growth Rate)) / (Discount Rate - Growth Rate)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-white font-medium">Growth Rate: 5%</p>
              <p className="text-muted-foreground">Conservative estimate of long-term earnings growth</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-white font-medium">Discount Rate: 9%</p>
              <p className="text-muted-foreground">Required rate of return (reflects risk)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Margin of Safety */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Margin of Safety & Ratings
        </h3>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            The <strong className="text-white">Margin of Safety</strong> is the difference between a stock's intrinsic value and its current price. 
            A positive margin means the stock is trading below its true worth.
          </p>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm text-center mb-6">
            <span className="text-primary">Margin of Safety</span> = (Intrinsic Value - Current Price) / Intrinsic Value
          </div>
          
          <h4 className="font-semibold text-white mb-3">How Ratings Are Determined:</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
              <div>
                <p className="font-bold text-green-400">BUY</p>
                <p className="text-sm text-green-400/80">
                  Stock price is more than 30% below intrinsic value (Margin of Safety &gt; 30%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <AlertTriangle className="h-6 w-6 text-yellow-400 shrink-0" />
              <div>
                <p className="font-bold text-yellow-400">HOLD</p>
                <p className="text-sm text-yellow-400/80">
                  Stock price is below intrinsic value but less than 30% discount (0% &lt; Margin of Safety ≤ 30%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <XCircle className="h-6 w-6 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-red-400">AVOID</p>
                <p className="text-sm text-red-400/80">
                  Stock price is at or above intrinsic value (Margin of Safety ≤ 0%) - considered overvalued
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-400 mb-1">Important Disclaimer</h4>
            <p className="text-sm text-yellow-400/80">
              This tool is for educational purposes only. The calculations use simplified models and should not be the sole basis 
              for investment decisions. Always do thorough research and consider consulting a financial advisor before investing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ScanAllStocks() {
  const [hasStarted, setHasStarted] = useState(false);
  
  const { data, isLoading, refetch } = useQuery<ScanAllResult>({
    queryKey: ["/api/scan-all"],
    queryFn: async () => {
      const res = await fetch("/api/scan-all");
      if (!res.ok) throw new Error("Failed to scan all stocks");
      return res.json();
    },
    enabled: hasStarted,
  });
  
  const handleScan = () => {
    setHasStarted(true);
    if (data) {
      refetch();
    }
  };
  
  return (
    <div className="space-y-6">
      {!hasStarted && (
        <div className="text-center py-8">
          <Layers className="h-16 w-16 mx-auto mb-4 text-primary opacity-70" />
          <h3 className="text-lg font-semibold text-white mb-2">Scan All Stocks</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Analyze 350+ stocks across 10 sectors including Tech, Energy, Finance, Healthcare, Industrials, Materials, Utilities, Real Estate, and Communication using Buffett-style metrics.
          </p>
          <Button onClick={handleScan} size="lg" data-testid="button-scan-all">
            <Layers className="h-5 w-5 mr-2" />
            Start Full Scan
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-white">Scanning all stocks...</p>
          <p className="text-sm text-muted-foreground">This may take a minute</p>
        </div>
      )}
      
      {data && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-green-400">{data.summary.buy}</p>
              <p className="text-sm text-green-400/70">BUY</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold text-yellow-400">{data.summary.hold}</p>
              <p className="text-sm text-yellow-400/70">HOLD</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold text-red-400">{data.summary.avoid}</p>
              <p className="text-sm text-red-400/70">AVOID</p>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-3xl font-bold text-gray-400">{data.summary.incomplete}</p>
              <p className="text-sm text-gray-400/70">INCOMPLETE</p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Top 10 by Margin of Safety
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-scan">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Top 10 Stocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.top_10_by_margin_of_safety.map((stock, i) => (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StockCard stock={stock} />
              </motion.div>
            ))}
          </div>
          
          {/* All Results */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              All {data.total_stocks} Stocks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.all_results.map((stock, i) => (
                <motion.div
                  key={stock.ticker}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                >
                  <StockCard stock={stock} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MarketNewsSidebar() {
  const { data, isLoading } = useQuery<{ news: NewsItem[] }>({
    queryKey: ["/api/market-news"],
    queryFn: async () => {
      const res = await fetch("/api/market-news");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-24">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-4 w-4 text-primary" />
              Market News
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            {data?.news?.map((item, i) => (
              <motion.a
                key={item.id || i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="block p-3 bg-background/50 border border-border rounded-lg hover:border-primary/50 hover:bg-background/80 transition-all group"
                data-testid={`news-item-${i}`}
              >
                <div className="flex items-start gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-16 h-12 object-cover rounded shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {item.headline}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.datetime)}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
            
            {!isLoading && (!data?.news || data.news.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No news available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Buffett Investment Engine</h1>
                <p className="text-xs text-muted-foreground">Value investing metrics</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-6 py-8 flex gap-6">
        <main className="flex-1 min-w-0">
        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="scan" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Search className="h-4 w-4 mr-2" />
              Stock Scanner
            </TabsTrigger>
            <TabsTrigger value="sector" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <PieChart className="h-4 w-4 mr-2" />
              Sector Screener
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Briefcase className="h-4 w-4 mr-2" />
              Portfolio Builder
            </TabsTrigger>
            <TabsTrigger value="scan-all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Layers className="h-4 w-4 mr-2" />
              Scan All
            </TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              How It Works
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Scan Individual Stocks
                </CardTitle>
                <CardDescription>
                  Analyze any stock using Warren Buffett-style metrics: ROE, ROIC, FCF Yield, Debt/Equity, and intrinsic value.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockScanner />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sector">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Screen by Sector
                </CardTitle>
                <CardDescription>
                  Analyze entire sectors and rank stocks by margin of safety.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectorScreener />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="portfolio">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Build Your Portfolio
                </CardTitle>
                <CardDescription>
                  Allocate capital across stocks using margin-of-safety weighted strategy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioBuilder />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scan-all">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Scan All Stocks
                </CardTitle>
                <CardDescription>
                  Analyze all stocks across every sector at once and find the best opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScanAllStocks />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="methodology">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Learn how the Buffett Investment Engine analyzes stocks and makes recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Methodology />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
        
        {/* News Sidebar */}
        <MarketNewsSidebar />
      </div>
    </div>
  );
}
