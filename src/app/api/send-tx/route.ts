import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { trx } = await req.json();
        if (!trx) {
            return NextResponse.json({ error: "Missing trx" }, { status: 400 });
        }
        // Decode base64
        let txBody;
        try {
            txBody = Buffer.from(trx, "base64").toString();
            JSON.parse(txBody); // Validate JSON
        } catch (err) {
            return NextResponse.json({ error: "Invalid encoded transaction body" }, { status: 400 });
        }

        // Forward to octra.network/send-tx
        let res;
        try {
            res = await fetch("https://octra.network/send-tx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: txBody,
            });
        } catch (err) {
            return NextResponse.json({ error: "Failed to reach Octra network" }, { status: 502 });
        }

        let data;
        try {
            data = await res.json();
        } catch (err) {
            return NextResponse.json({ error: "Invalid response from Octra network" }, { status: 502 });
        }

        if (!res.ok) {
            return NextResponse.json({ error: data?.error || "Octra network error", details: data }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 