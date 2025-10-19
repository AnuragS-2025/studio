
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    // In Next.js App Router API Routes, access environment variables via process.env
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.includes('ALPHAVANTAGE_API_KEY')) {
        return NextResponse.json({ error: 'API key is not configured. Please add ALPHAVANTAGE_API_KEY to your .env file.' }, { status: 500 });
    }

    if (!symbolsQuery) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }

    const appSymbols = symbolsQuery.split(',');
    const stockData: { [key: string]: any } = {};

    for (const appSymbol of appSymbols) {
        const alphaVantageSymbol = SYMBOL_MAP[appSymbol.toUpperCase()] || appSymbol.toUpperCase();
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data['Global Quote']) {
                const quote = data['Global Quote'];
                // Use the correct keys from the API response
                const price = parseFloat(quote['05. price']);
                const changePercent = parseFloat(quote['10. change percent']);

                if (!isNaN(price) && !isNaN(changePercent)) {
                    stockData[appSymbol] = {
                        price: price,
                        change: changePercent,
                    };
                } else {
                     stockData[appSymbol] = { error: `Invalid data for ${appSymbol}` };
                }
            } else if (data.Note) {
                 // This handles the API call frequency limit
                stockData[appSymbol] = { error: `API call limit reached for ${appSymbol}` };
                 // If we hit the limit, wait before the next call
                await delay(15000); // Wait 15 seconds
            } 
            else {
                stockData[appSymbol] = { error: `No data found for ${appSymbol}` };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            stockData[appSymbol] = { error: `Failed to fetch data for ${appSymbol}: ${message}` };
        }
        
        // Alpha Vantage has a rate limit of 5 calls per minute for the free tier. 
        // Adding a delay between calls to respect this limit.
        await delay(13000); // ~13 seconds delay between each API call
    }

    return NextResponse.json(stockData);
}
