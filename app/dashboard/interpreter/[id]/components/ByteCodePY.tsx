'use client'
import React, { useState } from 'react';
import { chatSession } from '@/utils/GeminiAIModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PythonToBytecodeProps {
    pythonCode: string;
    setB: React.Dispatch<React.SetStateAction<string>>
}

const PythonToBytecode: React.FC<PythonToBytecodeProps> = ({ pythonCode , setB}) => {
    const [loading, setLoading] = useState(false);
    const [bytecode, setBytecode] = useState('');
    const [open, setOpen] = useState(false);

    const generateBytecode = async () => {
        setLoading(true);
        const inputPrompt =  `Compile the following Python code into minimal, clean bytecode representation.

Python Code:
${pythonCode}

Requirements:
- Output ONLY essential bytecode instructions (no comments or explanations)
- Use concise format: LOAD, STORE, CALL, RETURN, JUMP operations
- Keep each instruction short and readable
- Remove redundant operations
- If there are errors, mention them at the top

Return the output strictly in the following JSON format without any additional text or code blocks:

{
  "bytecode": "Minimal bytecode here"
}`;
        try {
            const result = await chatSession.sendMessage(inputPrompt);
            const rawResponse = result.response.text();
            if (!rawResponse) {
                throw new Error('No response from API');
            }
            let jsonString = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const match = jsonString.match(/\{[\s\S]*\}/);
            if (match) {
                jsonString = match[0];
            }
            const parsedResponse = JSON.parse(jsonString);
            setBytecode(parsedResponse.bytecode);
            setB(parsedResponse.bytecode);
        } catch (error: any) {
            console.error('Error processing request:', error);
            const message = error?.message ?? String(error);
            let parsed: any = null;
            try {
                parsed = typeof message === 'string' ? JSON.parse(message) : null;
            } catch (_) {
                parsed = null;
            }
            const normalizedMessage = message.toLowerCase();
            let errorMsg: string;
            if (parsed?.error?.code === 503 || parsed?.error?.status === 'UNAVAILABLE' || normalizedMessage.includes('unavailable') || normalizedMessage.includes('overloaded')) {
                errorMsg = '⚠️ Gemini service is overloaded. Please wait a bit and try again.';
            } else if (normalizedMessage.includes('quota') || normalizedMessage.includes('429') || normalizedMessage === 'api_quota_exceeded') {
                errorMsg = '⚠️ API Quota Exceeded - Wait a few minutes or get a new API key';
            } else {
                errorMsg = 'Error generating bytecode: ' + message;
            }
            setBytecode(errorMsg);
            setB(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col p-10 border m-5 rounded-lg">
                <h1 className="text-xl font-bold mb-2">Bytecode Generation</h1>
                <p >Python bytecode is a low-level, platform-independent representation of Python source code, executed by the Python virtual machine (PVM). It serves as an intermediate step in Python execution, ensuring optimized performance and portability.</p>
                <Button onClick={() => setOpen(true)} className="mt-3">
                    Open Converter
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-screen-2xl w-[90vw] h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="p-4">Python Bytecode Generation</DialogTitle>
                    </DialogHeader>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-gray-300 text-sm overflow-auto max-h-60 border border-gray-700">
                        <pre>{pythonCode}</pre>
                    </div>
                    <Button 
                        onClick={generateBytecode} 
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg" 
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Convert to Bytecode'}
                    </Button>
                    {bytecode && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Generated Python Bytecode:</h2>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-green-400 text-sm min-h-80 max-h-96 overflow-y-auto border border-gray-700">
                                <pre className="whitespace-pre-wrap break-words">{bytecode}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PythonToBytecode;
