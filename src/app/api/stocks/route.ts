
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

    if (!apiKey) {
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    const appSymbols = symbolsQuery ? symbolsQuery.split(',') : Object.keys(SYMBOL_MAP);

    const stockData: { [key: string]: any } = {};
    const promises = [];

    for (const appSymbol of appSymbols) {
        // Ensure the symbol is uppercase for consistent lookup in SYMBOL_MAP
        const upperSymbol = appSymbol.toUpperCase();
        const alphaVantageSymbol = SYMBOL_MAP[upperSymbol] || upperSymbol;
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;
        
        promises.push(
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch data for ${appSymbol}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const quote = data['Global Quote'];
                    if (!quote || Object.keys(quote).length === 0) {
                        stockData[appSymbol] = { error: `No data found for symbol ${appSymbol}` };
                        return;
                    }
                    
                    stockData[appSymbol] = {
                        price: parseFloat(quote['05. price']),
                        change: parseFloat(quote['10. change percent'].replace('%', '')),
                    };
                })
                .catch(error => {
                    console.error(`Error fetching data for ${appSymbol}:`, error);
                    stockData[appSymbol] = { error: error.message };
                })
        );
    }

    try {
        await Promise.all(promises);
        return NextResponse.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data from Alpha Vantage:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
