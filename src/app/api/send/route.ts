import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const response = await fetch(`https://octra.network/send-tx`, {
            method: "POST",
            body: JSON.stringify(body)
        });
        const data = await response.json()
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 400 });
    }
}
