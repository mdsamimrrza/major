'use client'
import React, { useState } from "react";
import { Java9Lexer } from "@/parser/Java9Lexer";
import { Java9Parser } from "@/parser/Java9Parser";
import * as antlr4 from "antlr4ts";
import { CommonTokenStream } from "antlr4ts";
import { Tree } from "react-d3-tree";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import JavaASTToAssembly from "./ICG";

interface ASTNode {
  type: string;
  value?: string;
  position?: {
    line: number;
    column: number;
  };
  children: ASTNode[];
}

function displayAST(node: ASTNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  let output = `${indent}${node.type}`;

  if (node.value) {
    output += ` (${node.value})`;
  }

  if (node.position) {
    output += ` [L${node.position.line}:${node.position.column}]`;
  }

  output += '\n';

  for (const child of node.children) {
    output += displayAST(child, depth + 1);
  }

  return output;
}

const parseAST = (astString: string) => {
  const lines = astString.split("\n");
  const root = { name: "AST", children: [] };
  const stack = [{ node: root, depth: -1 }];

  lines.forEach((line) => {
    const match = line.match(/(\s*)([\w()]+.*)/);
    if (!match) return;

    const depth = match[1].length / 2;
    const name = match[2];
    const node = { name, children: [] };

    while (stack.length && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    stack[stack.length - 1].node.children.push(node);
    stack.push({ node, depth });
  });

  return root;
};

export function parseJavaToAST(code: string): string {
  const inputStream = new antlr4.ANTLRInputStream(code);
  const lexer = new Java9Lexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new Java9Parser(tokenStream);
  const tree = parser.compilationUnit();

  function processNode(node: any): ASTNode {
    const result: ASTNode = {
      type: node.constructor.name.replace(/Context$/, ''),
      children: []
    };

    if (node.symbol) {
      result.value = node.text;
      result.position = {
        line: node.symbol.line,
        column: node.symbol.charPositionInLine
      };
    }

    if (node.children) {
      for (const child of node.children) {
        if (child) {
          result.children.push(processNode(child));
        }
      }
    }

    return result;
  }

  const ast = processNode(tree);
  return displayAST(ast);
}

interface JavaASTViewerProps {
  javaCode: string;
}





const JavaASTViewer: React.FC<JavaASTViewerProps> = ({ javaCode }) => {
  const [astResult, setAstResult] = useState<string>("");
  const [treeData, setTreeData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sast, setSast] = useState<string>("")

  const handleParseClick = () => {
    console.log(astResult)
    const result = parseJavaToAST(javaCode);
    setAstResult(result);
    setTreeData(parseAST(result));
    setIsOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col p-10 border m-5 rounded-lg">
      <div className="text-xl font-bold mb-2">Syntax Analysis</div>
        Syntax analysis is the process of checking if the code follows the correct structure or grammar of the programming language. It takes the tokens from lexical analysis and arranges them into a tree-like structure called a syntax tree. This helps ensure the code is written in a way that makes sense according to the language rules, like making sure parentheses match or a statement is properly formed.
        <div className="text-xl font-bold my-2">Symentic Analysis</div>
        Semantic analysis  goes a step further. It checks whether the code makes sense logically. For example, it ensures that variables are declared before being used, functions are called with the correct number of arguments, and types are compatible. While syntax checks the "form" of the code, semantic analysis checks the "meaning" behind it to make sure everything works together.
          
        <Button className="mt-3" onClick={handleParseClick}>Parse Code</Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4">
            <DialogTitle>Abstract Syntax Tree</DialogTitle>

          </DialogHeader>
          {treeData && (
            <div className="w-full h-full p-4">
              <Tree
                data={treeData}
                orientation="vertical"
                translate={{ x: 400, y: 100 }}
                separation={{ siblings: 4, nonSiblings: 4 }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* <JavaASTToAssembly astString={astResult}/> */}
    </div>
  );
};

export default JavaASTViewer;
