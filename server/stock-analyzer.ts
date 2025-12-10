import yahooFinance from "yahoo-finance2";
import type { StockAnalysis } from "@shared/schema";

export async function calculateROE(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, { modules: ["financialData", "defaultKeyStatistics"] });
    const roe = (quote as any).financialData?.returnOnEquity;
    return roe !== undefined ? roe : null;
  } catch {
    return null;
  }
}

export async function calculateROIC(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, { modules: ["financialData"] });
    const data = quote as any;
    const roe = data.financialData?.returnOnEquity;
    const roa = data.financialData?.returnOnAssets;
    if (roe !== undefined && roa !== undefined) {
      return (roe + roa) / 2;
    }
    return roe ?? roa ?? null;
  } catch {
    return null;
  }
}

export async function calculateFCFYield(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, { modules: ["financialData", "price"] });
    const data = quote as any;
    const fcf = data.financialData?.freeCashflow;
    const marketCap = data.price?.marketCap;
    
    if (fcf && marketCap && marketCap > 0) {
      return fcf / marketCap;
    }
    return null;
  } catch {
    return null;
  }
}

export async function calculateDERatio(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, { modules: ["financialData"] });
    const debtToEquity = (quote as any).financialData?.debtToEquity;
    return debtToEquity !== undefined ? debtToEquity / 100 : null;
  } catch {
    return null;
  }
}

export async function calculateIntrinsicValue(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, { 
      modules: ["financialData", "defaultKeyStatistics", "price"] 
    });
    
    const data = quote as any;
    const eps = data.defaultKeyStatistics?.trailingEps;
    if (!eps || eps <= 0) return null;
    
    const growthRate = 0.05;
    const discountRate = 0.09;
    
    if (discountRate <= growthRate) return null;
    
    const intrinsicValue = (eps * (1 + growthRate)) / (discountRate - growthRate);
    
    return intrinsicValue > 0 ? intrinsicValue : null;
  } catch {
    return null;
  }
}

export async function getCurrentPrice(ticker: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quote(ticker);
    return (quote as any).regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

export async function analyzeTicker(ticker: string): Promise<StockAnalysis> {
  const upperTicker = ticker.toUpperCase();
  
  try {
    const [price, roe, roic, fcfYield, deRatio, intrinsic] = await Promise.all([
      getCurrentPrice(upperTicker),
      calculateROE(upperTicker),
      calculateROIC(upperTicker),
      calculateFCFYield(upperTicker),
      calculateDERatio(upperTicker),
      calculateIntrinsicValue(upperTicker),
    ]);
    
    let marginOfSafety: number | null = null;
    if (intrinsic && price && intrinsic > 0) {
      marginOfSafety = (intrinsic - price) / intrinsic;
    }
    
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
