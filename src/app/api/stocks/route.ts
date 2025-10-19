
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
 * API route handler for fetching real-time stock data from Alpha Vantage sequentially to respect rate limits.
 */
export async function GET(request: Request) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        return NextResponse.json(
            { error: 'API key is not configured. Please add ALPHAVANTAGE_API_KEY to your .env file and restart the server.' },
            { status: 500 }
        );
    }
    
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    const appSymbols = symbolsQuery ? symbolsQuery.split(',') : Object.keys(SYMBOL_MAP);

    const stockData: { [key: string]: any } = {};

    try {
        for (const appSymbol of appSymbols) {
            // Ensure the symbol is uppercase for consistent lookup in SYMBOL_MAP
            const upperSymbol = appSymbol.toUpperCase();
            const alphaVantageSymbol = SYMBOL_MAP[upperSymbol] || upperSymbol;
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Failed to fetch data for ${appSymbol}: ${response.statusText}`);
                stockData[appSymbol] = { error: `API request failed with status ${response.status}` };
                await delay(1500); // Wait before the next request even on failure
                continue;
            }

            const data = await response.json();
            
            // Critical check for API rate limit note or other errors.
            if (data.Note) {
                 console.warn(`Alpha Vantage API rate limit likely reached. Note: ${data.Note}`);
                 // Stop further requests to avoid being blocked.
                 // Return the data fetched so far.
                 stockData['error'] = 'API rate limit reached. Some data may be missing.';
                 break;
            }

            const quote = data['Global Quote'];
            if (!quote || Object.keys(quote).length === 0) {
                stockData[appSymbol] = { error: `No data found for symbol ${appSymbol}` };
                await delay(1500);
                continue;
            }
            
            const price = parseFloat(quote['05. price']);
            const changePercentString = quote['10. change percent'];
            const changePercent = parseFloat(changePercentString.replace('%', ''));

            if (isNaN(price) || isNaN(changePercent)) {
                 stockData[appSymbol] = { error: `Invalid data format for symbol ${appSymbol}` };
            } else {
                stockData[appSymbol] = {
                    price: price,
                    change: changePercent,
                };
            }
            
            // Add a delay between requests to avoid hitting rate limits.
            // The free tier is very restrictive. 1.5 seconds is a safer bet.
            await delay(1500); 
        }

        return NextResponse.json(stockData);

    } catch (error) {
        console.error('Error fetching stock data sequentially from Alpha Vantage:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
