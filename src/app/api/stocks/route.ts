
import { NextResponse } from 'next/server';

const SYMBOL_MAP: { [key: string]: string } = {
    'RELIANCE': 'RELIANCE.BSE',
    'TCS': 'TCS.BSE',
    'HDFCBANK': 'HDFCBANK.BSE',
    'INFY': 'INFY.BSE',
    'ICICIBANK': 'ICICIBANK.BSE',
    'SBIN': 'SBIN.BSE',
    'BHARTIARTL': 'BHARTIARTL.BSE',
    'L&T': 'LT.BSE',
    'HINDUNILVR': 'HINDUNILVR.BSE',
    'ITC': 'ITC.BSE',
};

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// This function now fetches data for a single symbol using TIME_SERIES_DAILY
// It's more reliable under free-tier rate limits.
async function fetchStockData(symbol: string, apiKey: string) {
    const alphaVantageSymbol = SYMBOL_MAP[symbol.toUpperCase()] || symbol.toUpperCase();
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check for the rate limit note
        if (data.Note) {
            console.warn(`Alpha Vantage API call limit likely reached for ${symbol}.`);
            return { error: `API call limit reached for ${symbol}. Please wait and try again.` };
        }
        
        const timeSeries = data['Time Series (Daily)'];
        if (timeSeries) {
            const latestDate = Object.keys(timeSeries)[0];
            const secondLatestDate = Object.keys(timeSeries)[1];
            
            if (latestDate && secondLatestDate) {
                const latestData = timeSeries[latestDate];
                const previousData = timeSeries[secondLatestDate];

                const price = parseFloat(latestData['4. close']);
                const prevClose = parseFloat(previousData['4. close']);
                
                if (!isNaN(price) && !isNaN(prevClose)) {
                    const changePercent = ((price - prevClose) / prevClose) * 100;
                    return {
                        price: price,
                        change: changePercent,
                    };
                }
            }
        }
        return { error: `No valid data found for ${symbol}` };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown fetch error';
        console.error(`Error fetching data for ${symbol}:`, message);
        return { error: `Failed to fetch data for ${symbol}: ${message}` };
    }
}


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'ALPHAVANTAGE_API_KEY') {
        return NextResponse.json({ error: 'API key is not configured. Please add ALPHAVANTAGE_API_KEY to your .env file.' }, { status: 500 });
    }

    if (!symbolsQuery) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const appSymbols = symbolsQuery.split(',');
    const stockData: { [key: string]: any } = {};

    // Process symbols sequentially with a delay to respect rate limits
    for (const appSymbol of appSymbols) {
        const data = await fetchStockData(appSymbol, apiKey);
        stockData[appSymbol] = data;
        
        // IMPORTANT: Wait for 13 seconds between each API call to respect the free tier limit (5 calls per minute)
        // We do this even if there's an error to avoid getting locked out.
        await delay(13000);
    }

    return NextResponse.json(stockData);
}
