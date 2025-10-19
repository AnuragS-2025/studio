
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


/**
 * API route handler for fetching real-time stock data from Alpha Vantage.
 */
export async function GET(request: Request) {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        return NextResponse.json(
            { error: 'API key is not configured. Please add ALPHAVANTAGE_API_KEY to your .env file.' },
            { status: 500 }
        );
    }
    
    // Get symbols from query parameters, default to a few if not provided
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    const appSymbols = symbolsQuery ? symbolsQuery.split(',') : Object.keys(SYMBOL_MAP);

    try {
        const stockDataPromises = appSymbols.map(async (appSymbol) => {
            const alphaVantageSymbol = SYMBOL_MAP[appSymbol.toUpperCase()] || appSymbol.toUpperCase();
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                // Pass the error message from Alpha Vantage if available
                const errorData = await response.text();
                throw new Error(`Failed to fetch data for ${appSymbol}: ${response.statusText} - ${errorData}`);
            }

            const data = await response.json();
            
            // Check for API call note (e.g., rate limiting)
            if (data.Note) {
                 console.warn(`Alpha Vantage API Note for ${appSymbol}: ${data.Note}`);
                 // Return a specific structure to indicate a throttled request
                 return { symbol: appSymbol, error: 'API rate limit reached. Please wait and try again.' };
            }

            const quote = data['Global Quote'];
            if (!quote || Object.keys(quote).length === 0) {
                return { symbol: appSymbol, error: `No data found for symbol ${appSymbol}` };
            }
            
            const price = parseFloat(quote['05. price']);
            const change = parseFloat(quote['09. change']);
            const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

            // Basic validation to ensure we have numbers
            if (isNaN(price) || isNaN(changePercent)) {
                 return { symbol: appSymbol, error: `Invalid data format for symbol ${appSymbol}` };
            }

            return {
                name: appSymbol, // Use the app's internal symbol name
                price: price,
                change: changePercent,
            };
        });

        const results = await Promise.all(stockDataPromises);
        
        const stockData: { [key: string]: any } = {};
        results.forEach(result => {
            if (result && !result.error) {
                stockData[result.name] = {
                    price: result.price,
                    change: result.change,
                };
            } else if (result && result.error) {
                // Pass the specific error for each symbol to the client
                stockData[result.symbol] = { error: result.error };
            }
        });

        return NextResponse.json(stockData);

    } catch (error) {
        console.error('Error fetching stock data from Alpha Vantage:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
