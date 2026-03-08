import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";

interface RegistrationBody {
  parentName: string;
  contactNumber: string;
  whatsappGroup: boolean;
  email?: string;
  homeAddress: string;
  childName: string;
  dateOfBirth: string;
  schoolName: string;
  classGrade: string;
  emergencyInfo?: string;
  preferredBatch: string;
  readingLevel: string;
  parentExpectations: string;
  declarationAgreed: boolean;
  parentSignature: string;
}

export async function POST(req: Request) {
  try {
    const body: RegistrationBody = await req.json();
    
    // The 'id' and 'createdAt' fields are now handled by the database schema
    const result = await db.insert(registrations).values(body).returning();

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Registration endpoint error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
