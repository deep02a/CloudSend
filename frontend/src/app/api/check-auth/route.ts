import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const response = await axios.get("http://localhost:5000/me", {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
