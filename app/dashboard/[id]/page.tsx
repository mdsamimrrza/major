'use client'
import { useEffect, useState } from 'react'
import Navbar from '../components/Nav'
import CodeEditor from './components/CodeEditor'
import LexicalAnalyzer from './components/LexicalAnalyser'
import JavaASTViewer from './components/JavaASTViewer'
import JavaToAssembly from './components/ICG'
import JavaToThreePass from './components/CO'




const page = ({ params }: { params: Promise<{ id: string }> }) => {
    const [id, setId] = useState<string | null>(null)
    const [c, setC] = useState(`\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`)

    useEffect(() => {
        params.then(({ id }) => setId(id))
    }, [params])
    return (
        <div>
            <Navbar />
            <div className='grid grid-cols-2'>
               
                <div className=' min-h-screen flex flex-col '>
                    <CodeEditor setC={setC} ide={id}/>

                </div>
                <div className='min-h-screen'>
                    <LexicalAnalyzer code={c} />
                    <JavaASTViewer javaCode={c} />
                    <JavaToAssembly javaCode={c}/>
                    <JavaToThreePass javaCode={c}/>
                </div>
                

            </div>
        </div>
    )
}
export default page
