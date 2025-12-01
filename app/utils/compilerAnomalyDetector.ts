/**
 * Compiler Anomaly Detection Utility
 * Detects anomalies in compiler outputs:
 * - Lexical analysis tokens
 * - Syntax/AST nodes
 * - Semantic analysis
 * - Bytecode/Assembly
 */

export interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
  lineNo?: number;
}

export interface AnomalyResult {
  isAnomalous: boolean;
  anomalyScore: number;
  anomalyType: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions?: string[];
}

export interface CompilerAnomalyAnalysis {
  stage: 'lexical' | 'syntax' | 'semantic' | 'bytecode';
  anomalies: AnomalyResult[];
  totalAnomalies: number;
  criticalIssues: number;
  summary: string;
}

/**
 * Lexical Analysis Anomaly Detection
 * Detects unusual token patterns, undefined symbols, invalid characters
 */
export function detectLexicalAnomalies(tokens: Token[]): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const tokenTypes = new Set<string>();
  const suspiciousPatterns: Record<string, number> = {};

  // Analyze token distribution
  tokens.forEach((token, index) => {
    tokenTypes.add(token.type);

    // Detect suspicious patterns
    if (token.type === 'IDENTIFIER') {
      // Single character identifiers (potential typo)
      if (token.value.length === 1) {
        suspiciousPatterns['single_char_id'] = (suspiciousPatterns['single_char_id'] || 0) + 1;
      }
      // ALL_CAPS identifiers mixed with lowercase (inconsistency)
      if (/^[A-Z_]+$/.test(token.value) && tokens[index - 1]?.type === 'IDENTIFIER' && !/^[A-Z_]+$/.test(tokens[index - 1].value)) {
        anomalies.push({
          isAnomalous: true,
          anomalyScore: 0.6,
          anomalyType: 'naming_inconsistency',
          message: `Naming convention anomaly: Mixed case styles in identifiers`,
          severity: 'medium',
          suggestions: ['Use consistent naming convention (camelCase or snake_case)']
        });
      }
    }

    // Detect consecutive operators (potential typo)
    if (token.type === 'OPERATOR') {
      if (tokens[index + 1]?.type === 'OPERATOR') {
        anomalies.push({
          isAnomalous: true,
          anomalyScore: 0.7,
          anomalyType: 'consecutive_operators',
          message: `Suspicious consecutive operators: ${token.value} ${tokens[index + 1].value}`,
          severity: 'high',
          suggestions: ['Check operator precedence', 'Verify logical expression']
        });
      }
    }
  });

  // Detect unusual token type distribution
  const tokenTypeArray = Array.from(tokenTypes);
  if (tokenTypeArray.length > 15) {
    anomalies.push({
      isAnomalous: true,
      anomalyScore: 0.5,
      anomalyType: 'high_token_diversity',
      message: `Unusual diversity in token types: ${tokenTypeArray.length} different types`,
      severity: 'medium',
      suggestions: ['Code complexity is high', 'Consider refactoring']
    });
  }

  return anomalies;
}

/**
 * Syntax/AST Anomaly Detection
 * Detects structural issues, unbalanced nodes, incorrect nesting
 */
export function detectSyntaxAnomalies(ast: ASTNode): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const depthMap = new Map<string, number>();
  const maxDepth = findMaxDepth(ast);

  // Detect deeply nested structures (potential stack overflow)
  if (maxDepth > 10) {
    anomalies.push({
      isAnomalous: true,
      anomalyScore: 0.75,
      anomalyType: 'excessive_nesting',
      message: `AST depth exceeds threshold: ${maxDepth} > 10`,
      severity: 'high',
      suggestions: ['Code nesting is too deep', 'Refactor into smaller functions', 'Risk of stack overflow']
    });
  }

  // Analyze node distribution
  analyzeNodeDistribution(ast, depthMap);
  
  // Detect unbalanced nodes
  depthMap.forEach((count, nodeType) => {
    if (count === 1) {
      anomalies.push({
        isAnomalous: true,
        anomalyScore: 0.4,
        anomalyType: 'single_node_anomaly',
        message: `Unique/Single occurrence of node type: ${nodeType}`,
        severity: 'low',
        suggestions: ['May indicate incomplete code or edge case']
      });
    }
  });

  return anomalies;
}

/**
 * Semantic Analysis Anomaly Detection
 * Detects type errors, undefined variables, scope issues
 */
export function detectSemanticAnomalies(
  code: string,
  symbolTable: Record<string, any> = {}
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const variables = new Set<string>();
  const usedVariables = new Set<string>();

  // Extract variable declarations and usages
  const varDeclPattern = /(?:let|const|var|int|string|float|double)\s+(\w+)/g;
  const varUsagePattern = /(\w+)\s*[=\+\-\*\/\(]/g;

  let match;
  while ((match = varDeclPattern.exec(code)) !== null) {
    variables.add(match[1]);
  }

  while ((match = varUsagePattern.exec(code)) !== null) {
    usedVariables.add(match[1]);
  }

  // Detect unused variables
  variables.forEach(v => {
    if (!usedVariables.has(v)) {
      anomalies.push({
        isAnomalous: true,
        anomalyScore: 0.5,
        anomalyType: 'unused_variable',
        message: `Variable '${v}' declared but never used`,
        severity: 'medium',
        suggestions: ['Remove unused variable', 'Or use it in the code']
      });
    }
  });

  // Detect potentially undefined variables
  usedVariables.forEach(v => {
    if (!variables.has(v) && !isBuiltinFunction(v)) {
      anomalies.push({
        isAnomalous: true,
        anomalyScore: 0.8,
        anomalyType: 'undefined_variable',
        message: `Potentially undefined variable: '${v}'`,
        severity: 'high',
        suggestions: ['Declare variable before use', 'Check variable name for typos']
      });
    }
  });

  return anomalies;
}

/**
 * Bytecode/Assembly Anomaly Detection
 * Detects unreachable code, infinite loops, memory leaks
 */
export function detectBytecodeAnomalies(bytecode: string[]): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const jumpTargets = new Set<number>();
  let unreachableStart = -1;

  // Analyze bytecode instructions
  for (let i = 0; i < bytecode.length; i++) {
    const instruction = bytecode[i];

    // Detect jump instructions
    if (instruction.includes('JMP') || instruction.includes('CALL')) {
      const target = extractJumpTarget(instruction);
      if (target !== null) jumpTargets.add(target);
    }

    // Detect return statements (marks end of reachable code)
    if (instruction.includes('RET')) {
      unreachableStart = i + 1;
    }
  }

  // Detect unreachable code
  if (unreachableStart !== -1) {
    for (let i = unreachableStart; i < bytecode.length; i++) {
      if (!jumpTargets.has(i)) {
        anomalies.push({
          isAnomalous: true,
          anomalyScore: 0.7,
          anomalyType: 'unreachable_code',
          message: `Unreachable bytecode instruction at line ${i}: ${bytecode[i]}`,
          severity: 'high',
          suggestions: ['Remove unreachable code', 'Check control flow logic']
        });
        break; // Report only first unreachable block
      }
    }
  }

  // Detect potential infinite loops
  for (let i = 0; i < bytecode.length - 1; i++) {
    if (bytecode[i].includes('JMP') && extractJumpTarget(bytecode[i]) <= i) {
      anomalies.push({
        isAnomalous: true,
        anomalyScore: 0.85,
        anomalyType: 'potential_infinite_loop',
        message: `Backward jump detected at line ${i} - potential infinite loop`,
        severity: 'critical',
        suggestions: ['Check loop termination condition', 'Verify loop counter increment']
      });
    }
  }

  return anomalies;
}

/**
 * Main function: Analyze complete compiler output for anomalies
 */
export async function analyzeCompilerAnomalies(
  code: string,
  tokens: Token[],
  ast: ASTNode,
  bytecode: string[]
): Promise<CompilerAnomalyAnalysis> {
  const lexicalAnomalies = detectLexicalAnomalies(tokens);
  const syntaxAnomalies = detectSyntaxAnomalies(ast);
  const semanticAnomalies = detectSemanticAnomalies(code);
  const bytecodeAnomalies = detectBytecodeAnomalies(bytecode);

  const allAnomalies = [
    ...lexicalAnomalies,
    ...syntaxAnomalies,
    ...semanticAnomalies,
    ...bytecodeAnomalies
  ];

  const criticalCount = allAnomalies.filter(a => a.severity === 'critical').length;
  const highCount = allAnomalies.filter(a => a.severity === 'high').length;

  let summary = `Found ${allAnomalies.length} anomalies`;
  if (criticalCount > 0) summary += ` - ${criticalCount} CRITICAL`;
  if (highCount > 0) summary += ` - ${highCount} HIGH`;

  return {
    stage: 'bytecode',
    anomalies: allAnomalies,
    totalAnomalies: allAnomalies.length,
    criticalIssues: criticalCount,
    summary
  };
}

// Helper functions
function findMaxDepth(node: ASTNode, currentDepth = 0): number {
  if (!node.children || node.children.length === 0) return currentDepth;
  return Math.max(...node.children.map(child => findMaxDepth(child, currentDepth + 1)));
}

function analyzeNodeDistribution(node: ASTNode, depthMap: Map<string, number>): void {
  depthMap.set(node.type, (depthMap.get(node.type) || 0) + 1);
  node.children?.forEach(child => analyzeNodeDistribution(child, depthMap));
}

function isBuiltinFunction(name: string): boolean {
  const builtins = ['print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple'];
  return builtins.includes(name);
}

function extractJumpTarget(instruction: string): number | null {
  const match = instruction.match(/JMP|CALL\s+(\d+)/);
  return match ? parseInt(match[1]) : null;
}
