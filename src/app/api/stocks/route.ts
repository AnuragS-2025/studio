
import { NextResponse } from 'next/server';

// A mapping from the simple symbols used in the app to the Alpha Vantage symbols
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API route handler for fetching real-time stock data from Alpha Vantage.
 */
export async function GET(request: Request) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'API key is not configured. Please add ALPHAVANTAGE_API_KEY to your .env file.' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    if (!symbolsQuery) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }
    const appSymbols = symbolsQuery.split(',');

    const stockData: { [key: string]: any } = {};
    
    for (const appSymbol of appSymbols) {
        // Ensure the symbol is uppercase for consistent lookup in SYMBOL_MAP
        const upperSymbol = appSymbol.toUpperCase();
        const alphaVantageSymbol = SYMBOL_MAP[upperSymbol] || upperSymbol;
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.Note) {
                // This indicates an API rate limit note, which means we should stop.
                console.warn(`Alpha Vantage API rate limit reached: ${data.Note}`);
                stockData[appSymbol] = { error: `API rate limit likely reached.` };
                // We'll stop further requests to avoid being locked out.
                break; 
            }
            
            const quote = data['Global Quote'];
            if (!quote || Object.keys(quote).length === 0) {
                stockData[appSymbol] = { error: `No data found for symbol ${appSymbol}` };
                continue; // Move to the next symbol
            }
            
            const price = parseFloat(quote['05. price']);
            const changePercent = parseFloat(quote['10. change percent']);

            if (isNaN(price) || isNaN(changePercent)) {
                 stockData[appSymbol] = { error: `Invalid data format for ${appSymbol}` };
                 continue;
            }

            stockData[appSymbol] = {
                price: price,
                change: changePercent,
            };

            // Delay to respect rate limits of the free tier (5 calls per minute)
            await delay(13000); 

        } catch (error) {
            console.error(`Error fetching data for ${appSymbol}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            stockData[appSymbol] = { error: errorMessage };
            // Optional: break here if one error is critical
        }
    }

    return NextResponse.json(stockData);
}
