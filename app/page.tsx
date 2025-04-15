
import Image from 'next/image'
import Link from 'next/link'
import Navbar from './dashboard/components/Nav'
import { Button } from '@/components/ui/button'

export default async function Home() {

  return (
    <>
      <Navbar />
      <section className="h-full w-full md:pt-44 mt-[-110px] relative flex items-center justify-center flex-col ">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        <div >
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            ParseX
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-60px]">
          <Image
            src={'/preview.png'}
            alt="banner image"
            height={1200}
            width={1200}
            className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted shadow-lg"
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 md:!mt-20 mt-[-60px]">
        <h2 className="text-4xl mt-4 text-center"> Welcome to ParseX: Visualize Your Code Like Never Before!</h2>
        <p className="text-muted-foreground text-center">
        Ever wondered how your code transforms into machine instructions? <br/>
        <span className='font-semibold'>ParseX</span> brings your programs to life with interactive visualizations of the compilation process.
        </p>
        
        <Link href={'/dashboard'}><Button className='text-5xl mb-10 p-10'>Get Started</Button></Link>
      </section>
    </>
  )
}

