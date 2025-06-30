import { NextResponse } from 'next/server';
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) {
        return NextResponse.json({ message: "Invalid address" }, { status: 400 });
    }
    const response = await fetch(
        `https://octra.network/address/${address}?limit=20`
    );

    if (!response.ok) {
        return NextResponse.json({ message: "Unknown error" }, { status: 400 });
    }

    const data = await response.json();
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const body = await request.json();
    return NextResponse.json({ received: body });
}
