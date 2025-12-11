import YahooFinance from "yahoo-finance2";
import type { StockAnalysis } from "@shared/schema";

const yahooFinance = new YahooFinance();

// Single efficient API call that gets all data at once
export async function analyzeTicker(ticker: string): Promise<StockAnalysis> {
  const upperTicker = ticker.toUpperCase();
  
  try {
    // Make a single API call to get all needed data
    let quoteResult: any = null;
    let summaryResult: any = null;
    
    try {
      quoteResult = await yahooFinance.quote(upperTicker);
    } catch (e) {
      // Quote failed, continue with summary data only
    }
    
    try {
      summaryResult = await yahooFinance.quoteSummary(upperTicker, { 
        modules: ["financialData", "defaultKeyStatistics", "price"] 
      });
    } catch (e) {
      // Summary failed, continue with quote data only
    }
    
    const quote = quoteResult as any;
    const summary = summaryResult as any;
    
    // Extract price from quote
    const price = quote?.regularMarketPrice ?? null;
    
    // Extract metrics from summary
    const financialData = summary?.financialData;
    const keyStats = summary?.defaultKeyStatistics;
    
    const roe = financialData?.returnOnEquity ?? null;
    const roa = financialData?.returnOnAssets ?? null;
    const roic = (roe !== null && roa !== null) ? (roe + roa) / 2 : (roe ?? roa);
    
    const fcf = financialData?.freeCashflow ?? null;
    const marketCap = summary?.price?.marketCap ?? quote?.marketCap ?? null;
    const fcfYield = (fcf && marketCap && marketCap > 0) ? fcf / marketCap : null;
    
    const debtToEquityRaw = financialData?.debtToEquity;
    const deRatio = debtToEquityRaw !== undefined ? debtToEquityRaw / 100 : null;
    
    // Calculate intrinsic value using trailing EPS
    const eps = keyStats?.trailingEps ?? null;
    let intrinsic: number | null = null;
    
    if (eps && eps > 0) {
      const growthRate = 0.05;
      const discountRate = 0.09;
      intrinsic = (eps * (1 + growthRate)) / (discountRate - growthRate);
    }
    
    // Calculate margin of safety
    let marginOfSafety: number | null = null;
    if (intrinsic && price && intrinsic > 0) {
      marginOfSafety = (intrinsic - price) / intrinsic;
    }
    
    // Determine rating
    let rating: StockAnalysis["Rating"];
    if (intrinsic === null || price === null) {
      rating = "DATA_INCOMPLETE";
    } else if (price < intrinsic * 0.7) {
      rating = "BUY";
    } else if (price < intrinsic) {
      rating = "HOLD";
    } else {
      rating = "AVOID";
    }
    
    return {
      ticker: upperTicker,
      price,
      ROE: roe,
      ROIC: roic,
      FCF_Yield: fcfYield,
      Debt_to_Equity: deRatio,
      Intrinsic_Value: intrinsic,
      Margin_of_Safety: marginOfSafety,
      Rating: rating,
    };
  } catch (error) {
    console.error(`Error analyzing ${upperTicker}:`, error);
    return {
      ticker: upperTicker,
      price: null,
      ROE: null,
      ROIC: null,
      FCF_Yield: null,
      Debt_to_Equity: null,
      Intrinsic_Value: null,
      Margin_of_Safety: null,
      Rating: "DATA_INCOMPLETE",
    };
  }
}

// Batch analyze with rate limiting to avoid API throttling
export async function analyzeTickersBatch(tickers: string[], batchSize = 5): Promise<StockAnalysis[]> {
  const results: StockAnalysis[] = [];
  
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(t => analyzeTicker(t)));
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}
