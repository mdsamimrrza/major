'use client'
import React, { useState } from 'react';
import { chatSession } from '@/utils/GeminiAIModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JavaToThreePassProps {
    javaCode: string;
}

const JavaToThreePass: React.FC<JavaToThreePassProps> = ({ javaCode }) => {
    const [loading, setLoading] = useState(false);
    const [assemblyCode, setAssemblyCode] = useState('');
    const [open, setOpen] = useState(false);

    const generateAssembly = async () => {
        setLoading(true);
        const inputPrompt = `Convert the following Java code into three-pass Assembly language:\n  
\nJava Code:\n${javaCode}\n  
\nEnsure that the Assembly code follows a three-pass compilation approach and adheres to standard Assembly syntax. If the Java code is highly complex (such as involving recursion, backtracking, or intricate logic), return a simplified gist of how the Assembly code would be structured, highlighting key sections like stack management, function calls, and loop handling.\n  
\nReturn the output strictly in the following JSON format without any additional text or code blocks:\n  
\n{  
  "assembly": "Generated Assembly code here"  
}\n  
\nThis must ensure that the response is always in a strict JSON format without unnecessary text or formatting issues.
`;
        try {
            const result = await chatSession.sendMessage(inputPrompt);
            const rawResponse = result.response.text();
            const cleanResponse = rawResponse.replace('```json', '').replace('```', '');
            const parsedResponse = JSON.parse(cleanResponse);
            setAssemblyCode(parsedResponse.assembly);
        } catch (error) {
            console.error('Error processing request:', error);
            setAssemblyCode('Error generating assembly code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-10 border m-5 rounded-lg">
                <h1 className="text-xl font-bold mb-2">Three-Pass Assembly Code Generation</h1>
                <p>Three-pass assembly code generation refines the source code through multiple traversals. The first pass collects label addresses, the second pass resolves symbolic references, and the third pass generates the final machine code. This method ensures optimization and accuracy in the compiled output.</p>
                <Button onClick={() => setOpen(true)} className="mt-3">
                    Open Converter
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="p-4">Three-Pass Assembly Code Generation</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-300 text-sm overflow-auto max-h-60 border border-gray-700">
                        <pre>{javaCode}</pre>
                    </div>
                    <Button
                        onClick={generateAssembly}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Convert to Assembly'}
                    </Button>
                    {assemblyCode && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Generated Assembly Code:</h2>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-green-400 text-sm min-h-80 max-h-96 overflow-y-auto border border-gray-700">
                                <pre className="whitespace-pre-wrap break-words">{assemblyCode}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JavaToThreePass;