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

// Sector definitions - Expanded with major stocks
export const SECTOR_TICKERS: Record<string, string[]> = {
  tech: [
    "AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "META", "ADBE", "ORCL", "AMD", "AVGO",
    "CRM", "CSCO", "INTC", "IBM", "QCOM", "TXN", "NOW", "INTU", "AMAT", "MU",
    "LRCX", "ADI", "KLAC", "SNPS", "CDNS", "MRVL", "NXPI", "MCHP", "ON", "FTNT",
    "PANW", "CRWD", "ZS", "DDOG", "NET", "TEAM", "SNOW", "PLTR", "SHOP", "SQ",
    "PYPL", "DOCU", "ZM", "TWLO", "OKTA", "MDB", "SPLK", "WDAY", "RNG", "HUBS"
  ],
  energy: [
    "XOM", "CVX", "COP", "EOG", "SLB", "MPC", "PSX", "VLO", "OXY", "PXD",
    "HES", "DVN", "HAL", "BKR", "FANG", "MRO", "APA", "CTRA", "OVV", "EQT",
    "KMI", "WMB", "OKE", "TRGP", "LNG", "EPD", "ET", "MPLX", "PAA", "DCP"
  ],
  finance: [
    "JPM", "BAC", "WFC", "GS", "MS", "BLK", "SCHW", "C", "USB", "PNC",
    "TFC", "AXP", "COF", "BK", "STT", "SPGI", "MCO", "ICE", "CME", "MSCI",
    "CB", "AON", "MMC", "AIG", "MET", "PRU", "TRV", "ALL", "PGR", "AFL",
    "AMP", "RJF", "NTRS", "FITB", "HBAN", "CFG", "KEY", "MTB", "RF", "ZION"
  ],
  consumer: [
    "PG", "KO", "PEP", "MCD", "COST", "WMT", "DIS", "NKE", "SBUX", "TGT",
    "HD", "LOW", "TJX", "ROST", "DG", "DLTR", "ORLY", "AZO", "BBY", "TSCO",
    "YUM", "DPZ", "CMG", "DARDEN", "HLT", "MAR", "LVS", "WYNN", "MGM", "RCL",
    "CCL", "NCLH", "BKNG", "ABNB", "UBER", "LYFT", "DASH", "EBAY", "ETSY", "W",
    "CL", "KMB", "EL", "MNST", "KDP", "STZ", "TAP", "BUD", "DEO", "PM"
  ],
  healthcare: [
    "JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY", "TMO", "ABT", "DHR", "BMY",
    "AMGN", "GILD", "VRTX", "REGN", "BIIB", "MRNA", "ISRG", "SYK", "MDT", "BSX",
    "EW", "ZBH", "BDX", "BAX", "DXCM", "IDXX", "A", "MTD", "WAT", "PKI",
    "CVS", "CI", "ELV", "HUM", "CNC", "MOH", "ALGN", "HOLX", "ILMN", "TECH"
  ],
  industrials: [
    "CAT", "DE", "GE", "HON", "UNP", "UPS", "RTX", "BA", "LMT", "NOC",
    "GD", "MMM", "EMR", "ITW", "PH", "ROK", "ETN", "AME", "CMI", "PCAR",
    "FDX", "CSX", "NSC", "DAL", "UAL", "AAL", "LUV", "JBLU", "ALK", "ODFL",
    "XPO", "CHRW", "EXPD", "GWW", "FAST", "WW", "IR", "TT", "CARR", "OTIS"
  ],
  materials: [
    "LIN", "APD", "SHW", "ECL", "DD", "DOW", "LYB", "PPG", "NEM", "FCX",
    "CTVA", "CF", "MOS", "NUE", "STLD", "CLF", "X", "AA", "BALL", "PKG",
    "IP", "WRK", "AVY", "MLM", "VMC", "CX", "EXP", "SUM", "USCR", "USLM"
  ],
  utilities: [
    "NEE", "DUK", "SO", "D", "AEP", "SRE", "XEL", "EXC", "ED", "WEC",
    "ES", "DTE", "PPL", "FE", "AES", "ETR", "CMS", "CNP", "NI", "EVRG",
    "PNW", "ATO", "NJR", "OGS", "SWX", "NWE", "BKH", "AVA", "POR", "IDA"
  ],
  realestate: [
    "AMT", "PLD", "CCI", "EQIX", "PSA", "SPG", "O", "WELL", "DLR", "AVB",
    "EQR", "VTR", "ARE", "MAA", "UDR", "ESS", "CPT", "INVH", "SUI", "ELS",
    "SBAC", "VICI", "GLPI", "NNN", "WPC", "STOR", "ADC", "EPRT", "KIM", "REG"
  ],
  communication: [
    "T", "VZ", "TMUS", "CMCSA", "CHTR", "NFLX", "DIS", "WBD", "PARA", "FOX",
    "FOXA", "EA", "TTWO", "ATVI", "RBLX", "MTCH", "PINS", "SNAP", "SPOT", "LYV",
    "IPG", "OMC", "WPP", "ROKU", "FUBO", "SIRI", "LUMN", "FYBR", "LBRDA", "LBRDK"
  ],
};
