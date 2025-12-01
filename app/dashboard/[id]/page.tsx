'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import CodeEditor from './components/CodeEditor'
import LexicalAnalyzer from './components/LexicalAnalyser'
import JavaASTViewer from './components/JavaASTViewer'
import JavaToAssembly from './components/ICG'
import JavaToThreePass from './components/CO'

const Navbar = dynamic(() => import('../components/Nav'), { ssr: false })

const page = ({ params }: { params: Promise<{ id: string }> }) => {
    const [id, setId] = useState<string | null>(null)
    const [c, setC] = useState(`\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`)
    const [language, setLanguage] = useState<'java' | 'cpp'>('java')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        params.then(({ id }) => setId(id))
    }, [params])

    if (!mounted) {
        return null
    }

    return (
        <div>
            <Navbar />
            <div className='grid grid-cols-2'>
               
                <div className=' min-h-screen flex flex-col '>
                    <CodeEditor setC={setC} ide={id} onLanguageChange={(lang) => setLanguage(lang as 'java' | 'cpp')} initialLanguage={language}/>

                </div>
                <div className='min-h-screen'>
                    <LexicalAnalyzer code={c} language={language} />
                    <JavaASTViewer code={c} language={language} />
                    <JavaToAssembly code={c} language={language}/>
                    <JavaToThreePass code={c} language={language}/>
                </div>
                

            </div>
        </div>
    )
}
export default page
