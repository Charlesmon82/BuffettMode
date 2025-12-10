import { z } from "zod";

// Stock Analysis Result
export interface StockAnalysis {
  ticker: string;
  price: number | null;
  ROE: number | null;
  ROIC: number | null;
  FCF_Yield: number | null;
  Debt_to_Equity: number | null;
  Intrinsic_Value: number | null;
  Margin_of_Safety: number | null;
  Rating: "BUY" | "HOLD" | "AVOID" | "DATA_INCOMPLETE";
}

// Sector Screening Result
export interface SectorResult {
  sector: string;
  tickers: string[];
  top_5_by_margin_of_safety: StockAnalysis[];
  all_results: StockAnalysis[];
}

// Portfolio Request
export const portfolioRequestSchema = z.object({
  capital: z.number().positive(),
  tickers: z.array(z.string().min(1)).min(1).max(20),
});

export type PortfolioRequest = z.infer<typeof portfolioRequestSchema>;

// Portfolio Allocation
export interface PortfolioAllocation {
  ticker: string;
  rating: string;
  price: number;
  weight?: number;
  allocated_cash: number;
  shares: number;
}

export interface PortfolioResult {
  strategy: string;
  total_capital: number;
  allocations: PortfolioAllocation[];
}

// Sector definitions
export const SECTOR_TICKERS: Record<string, string[]> = {
  tech: ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "ADBE", "ORCL", "AMD", "CRM", "AVGO"],
  energy: ["XOM", "CVX", "COP", "EOG", "SLB", "MPC", "PSX"],
  finance: ["JPM", "BAC", "WFC", "GS", "MS", "BLK", "SCHW"],
  consumer: ["PG", "KO", "PEP", "MCD", "COST", "WMT", "DIS"],
  healthcare: ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY", "TMO"],
};
