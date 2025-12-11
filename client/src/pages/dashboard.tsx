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
  RefreshCw
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
};

function StockCard({ stock }: { stock: StockAnalysis }) {
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
            Analyze all {45}+ stocks across Tech, Energy, Finance, Consumer, and Healthcare sectors using Buffett-style metrics.
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
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
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
        </Tabs>
      </main>
    </div>
  );
}
