import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeCompilerAnomalies,
  Token,
  ASTNode,
  CompilerAnomalyAnalysis,
} from '@/app/utils/compilerAnomalyDetector';

interface CompilerAnalysisPayload {
  code: string;
  tokens: Token[];
  ast: ASTNode;
  bytecode: string[];
}

/**
 * API Endpoint: Analyze compiler output for anomalies
 * POST /api/compilerAnomalyAnalysis
 * 
 * Detects anomalies across all compiler stages
 */
export async function POST(request: NextRequest) {
  try {
    const body: CompilerAnalysisPayload = await request.json();

    if (!body.tokens || !body.ast || !body.bytecode) {
      return NextResponse.json(
        { error: 'Missing required fields: tokens, ast, bytecode' },
        { status: 400 }
      );
    }

    const analysis: CompilerAnomalyAnalysis = await analyzeCompilerAnomalies(
      body.code || '',
      body.tokens,
      body.ast,
      body.bytecode
    );

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compiler anomaly analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze compiler output',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/compilerAnomalyAnalysis',
    method: 'POST',
    description: 'Analyze compiler output for anomalies',
    anomalyTypes: [
      'naming_inconsistency',
      'consecutive_operators',
      'excessive_nesting',
      'unused_variable',
      'undefined_variable',
      'unreachable_code',
      'potential_infinite_loop',
    ],
  });
}
