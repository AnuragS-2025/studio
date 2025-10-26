
// simple mock chart until you fetch intraday data
function generateMockChart(base: number, points = 12) {
  const data = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.5) * (base * 0.02);
    data.push({ value: Math.round(current * 100) / 100 });
  }
  return data;
}

export async function fetchMarketData(symbols: string[]) {
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
  const results = [];

  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${apiKey}`
      );

      const data = await response.json();
      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        console.warn(`No data for symbol: ${symbol}. It might be an invalid symbol or an API limit was reached.`);
        continue;
      };

      results.push({
        name: symbol,
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["10. change percent"]),
        chartData: generateMockChart(parseFloat(quote["05. price"])),
      });
    } catch (err) {
      console.error("Error fetching data for", symbol, err);
    }
  }

  return results;
}
