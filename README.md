# BuffettMode 🧠📈

**BuffettMode** is a stock analysis engine that evaluates public companies using
Warren Buffett–style value investing principles.

It focuses on **fundamental business strength**, not hype or short-term price action.

---

## 🔍 What BuffettMode Analyzes

BuffettMode evaluates stocks using:

- **ROE** – Return on Equity  
- **ROIC** – Return on Invested Capital  
- **Free Cash Flow Yield**
- **Debt-to-Equity Ratio**
- **Intrinsic Value (DCF-based)**
- **Margin of Safety**
- **Final Rating**: BUY / HOLD / AVOID / DATA_INCOMPLETE

---

## 🧠 Philosophy

> "Price is what you pay. Value is what you get." — Warren Buffett

BuffettMode prioritizes:
- Consistent profitability
- Capital efficiency
- Conservative debt
- Long-term intrinsic value

---

## 🧩 Project Structure

```
├── client/                 # React frontend
│   └── src/
│       └── pages/
│           └── dashboard.tsx   # Main dashboard with all features
├── server/
│   ├── routes.ts           # API endpoints
│   └── stock-analyzer.ts   # Yahoo Finance integration & metrics
├── shared/
│   └── schema.ts           # Data models & sector definitions
└── package.json
```

---

## 🚀 Features

- **Stock Scanner** – Analyze individual stocks with Buffett-style metrics
- **Sector Screener** – Screen entire sectors (350+ stocks across 10 sectors)
- **Portfolio Builder** – Build portfolios with margin-of-safety-weighted allocation
- **Scan All** – Analyze all stocks at once
- **Market News** – Real-time financial news sidebar
- **Expandable Analysis** – "Why BUY/HOLD/AVOID?" reasoning for each stock

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Data**: Yahoo Finance API (yahoo-finance2)
- **News**: Finnhub API

---

## 🚀 How It Works

1. Enter a stock ticker (e.g. `AAPL`, `GOOGL`)
2. BuffettMode pulls financial data
3. Metrics are calculated using value-investing formulas
4. An intrinsic value and margin of safety are computed
5. A final investment rating is returned

---

## 🧪 Example Output

```json
{
  "ticker": "AAPL",
  "price": 178.50,
  "ROE": 0.147,
  "ROIC": 0.312,
  "FCF_Yield": 0.045,
  "Debt_to_Equity": 1.81,
  "Intrinsic_Value": 142.30,
  "Margin_of_Safety": -0.254,
  "Rating": "AVOID"
}
```

---

## ⚠️ Disclaimer

This project is for **educational and research purposes only**.  
It does **not** constitute financial advice.

Always do your own research or consult a licensed financial professional.

---

## 📌 Roadmap

- Sector comparison ✅
- Portfolio builder ✅
- Historical intrinsic value tracking
- Alerts & watchlists

---

## 📄 License

MIT
