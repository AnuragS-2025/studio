
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

const BASE_PRICES: { [key: string]: number } = {
    'RELIANCE': 2950.0,
    'TCS': 3850.0,
    'HDFCBANK': 1680.0,
    'INFY': 1550.0,
    'ICICIBANK': 1100.0,
    'SBIN': 830.0,
    'BHARTIARTL': 1400.0,
    'L&T': 3600.0,
    'HINDUNILVR': 2400.0,
    'ITC': 430.0,
};

/**
 * API route handler for fetching real-time stock data.
 * This version generates mock data to avoid dependency on an external API key.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolsQuery = searchParams.get('symbols');
    if (!symbolsQuery) {
        return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
    }
    const appSymbols = symbolsQuery.split(',');

    const stockData: { [key: string]: any } = {};
    
    for (const appSymbol of appSymbols) {
        const upperSymbol = appSymbol.toUpperCase();
        const basePrice = BASE_PRICES[upperSymbol] || (Math.random() * 5000);

        // Simulate some price fluctuation
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.1); 
        // Simulate some percentage change
        const change = (Math.random() - 0.5) * 5; // a value between -2.5 and 2.5

        stockData[appSymbol] = {
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
        };
    }

    return NextResponse.json(stockData);
}
