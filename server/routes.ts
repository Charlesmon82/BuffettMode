import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeTicker, analyzeTickersBatch } from "./stock-analyzer";
import { SECTOR_TICKERS, portfolioRequestSchema } from "@shared/schema";
import type { StockAnalysis, SectorResult, PortfolioResult } from "@shared/schema";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Scan a single ticker
  app.get("/api/scan/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      if (!ticker || ticker.length > 10) {
        return res.status(400).json({ error: "Invalid ticker symbol" });
      }
      
      const result = await analyzeTicker(ticker);
      res.json(result);
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ error: "Failed to analyze ticker" });
    }
  });
  
  // Scan a sector
  app.get("/api/sector/:sectorName", async (req, res) => {
    try {
      const { sectorName } = req.params;
      const key = sectorName.toLowerCase();
      
      if (!(key in SECTOR_TICKERS)) {
        return res.status(400).json({
          sector: sectorName,
          available_sectors: Object.keys(SECTOR_TICKERS),
          error: "Unknown sector. Use one of the available_sectors."
        });
      }
      
      const tickers = SECTOR_TICKERS[key];
      
      // Analyze all tickers with rate limiting
      const results = await analyzeTickersBatch(tickers, 5);
      
      // Sort by margin of safety (highest first)
      const sortedResults = [...results].sort((a, b) => {
        const aVal = a.Margin_of_Safety ?? -999;
        const bVal = b.Margin_of_Safety ?? -999;
        return bVal - aVal;
      });
      
      const response: SectorResult = {
        sector: key,
        tickers,
        top_5_by_margin_of_safety: sortedResults.slice(0, 5),
        all_results: sortedResults,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Sector scan error:", error);
      res.status(500).json({ error: "Failed to scan sector" });
    }
  });
  
  // Get available sectors
  app.get("/api/sectors", (_req, res) => {
    res.json({
      sectors: Object.keys(SECTOR_TICKERS),
      ticker_counts: Object.fromEntries(
        Object.entries(SECTOR_TICKERS).map(([k, v]) => [k, v.length])
      ),
    });
  });
  
  // Scan all stocks across all sectors
  app.get("/api/scan-all", async (_req, res) => {
    try {
      // Get all unique tickers from all sectors
      const allTickersSet = new Set(Object.values(SECTOR_TICKERS).flat());
      const allTickers = Array.from(allTickersSet);
      
      console.log(`Scanning ${allTickers.length} stocks...`);
      
      // Analyze all tickers with rate limiting
      const results = await analyzeTickersBatch(allTickers, 10);
      
      // Sort by margin of safety (highest first)
      const sortedResults = [...results].sort((a, b) => {
        const aVal = a.Margin_of_Safety ?? -999;
        const bVal = b.Margin_of_Safety ?? -999;
        return bVal - aVal;
      });
      
      // Group by rating
      const buyStocks = sortedResults.filter(s => s.Rating === "BUY");
      const holdStocks = sortedResults.filter(s => s.Rating === "HOLD");
      const avoidStocks = sortedResults.filter(s => s.Rating === "AVOID");
      const incompleteStocks = sortedResults.filter(s => s.Rating === "DATA_INCOMPLETE");
      
      res.json({
        total_stocks: allTickers.length,
        summary: {
          buy: buyStocks.length,
          hold: holdStocks.length,
          avoid: avoidStocks.length,
          incomplete: incompleteStocks.length,
        },
        top_10_by_margin_of_safety: sortedResults.slice(0, 10),
        all_results: sortedResults,
      });
    } catch (error) {
      console.error("Scan all error:", error);
      res.status(500).json({ error: "Failed to scan all stocks" });
    }
  });
  
  // Build portfolio
  app.post("/api/portfolio", async (req, res) => {
    try {
      const parsed = portfolioRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parsed.error.issues 
        });
      }
      
      const { capital, tickers } = parsed.data;
      
      // Analyze all tickers
      const analyses = await Promise.all(
        tickers.map(t => analyzeTicker(t))
      );
      
      // Build scores based on margin of safety
      const scores = analyses.map(a => {
        const mos = a.Margin_of_Safety;
        return (mos !== null && mos > 0) ? mos : 0;
      });
      
      const totalScore = scores.reduce((a, b) => a + b, 0);
      
      if (totalScore === 0) {
        // Equal weight if no positive margins
        const perStock = capital / Math.max(analyses.length, 1);
        const allocations = analyses.map(a => {
          const price = a.price ?? 0;
          return {
            ticker: a.ticker,
            rating: a.Rating,
            price,
            allocated_cash: Math.round(perStock * 100) / 100,
            shares: price > 0 ? Math.floor(perStock / price) : 0,
          };
        });
        
        const response: PortfolioResult = {
          strategy: "equal_weight (no positive margin_of_safety found)",
          total_capital: capital,
          allocations,
        };
        return res.json(response);
      }
      
      // Margin-of-safety weighted allocation
      const allocations = analyses.map((a, i) => {
        const weight = scores[i] / totalScore;
        const cashForThis = capital * weight;
        const price = a.price ?? 0;
        
        return {
          ticker: a.ticker,
          rating: a.Rating,
          price,
          weight: Math.round(weight * 1000) / 1000,
          allocated_cash: Math.round(cashForThis * 100) / 100,
          shares: price > 0 ? Math.floor(cashForThis / price) : 0,
        };
      });
      
      const response: PortfolioResult = {
        strategy: "margin_of_safety_weighted",
        total_capital: capital,
        allocations,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Portfolio error:", error);
      res.status(500).json({ error: "Failed to build portfolio" });
    }
  });

  // Market News from Finnhub
  app.get("/api/market-news", async (_req, res) => {
    try {
      if (!FINNHUB_API_KEY) {
        return res.status(500).json({ error: "Finnhub API key not configured" });
      }
      
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch news from Finnhub");
      }
      
      const news = await response.json();
      
      // Return top 10 news items with only needed fields
      const formattedNews = (news as any[]).slice(0, 10).map((item: any) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary?.slice(0, 200) + (item.summary?.length > 200 ? "..." : ""),
        source: item.source,
        url: item.url,
        image: item.image,
        datetime: item.datetime,
        related: item.related,
      }));
      
      res.json({ news: formattedNews });
    } catch (error) {
      console.error("Market news error:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  return httpServer;
}
