"use client"
import React from 'react'
import Link from 'next/link';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';



const Navbar = () => {

    const [progress, setProgress] = useState(0)
    const pathname = usePathname()

    useEffect(() => {
        setProgress(20)

        setTimeout(() => {
            setProgress(40)
        }, 100);

        setTimeout(() => {
            setProgress(100)
        }, 400);

    }, [pathname])



    useEffect(() => {
        setTimeout(() => {
            setProgress(0)
        }, 50);
    }, [])


    return (
        <nav className="p-4 bg-background/50 sticky top-0 backdrop-blur border-b z-10">
            <div className="container mx-auto flex justify-between items-center">
                <Link href={"/"}><div className="text-lg font-bold">
                    ParseX
                </div></Link>
                <div className="hidden md:flex space-x-5 items-center">
                    <Link href="/" className="hover:scale-105 hover:font-semibold transition-transform duration-300"> Home
                    </Link>
                    <Link href="/dashboard" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                        Dashboard
                    </Link>
                    {/* <Link href="/about" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                        About
                    </Link>
                    <Link href="/team" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                        Team
                    </Link> */}
                    <SignedIn>

                        <UserButton />
                    </SignedIn>

                    <SignedOut >
                        <div className='bg-black text-white p-2 rounded-lg'> <SignInButton /></div>
                    </SignedOut>

                </div>

                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle className="font-bold my-4">HarryBlog</SheetTitle>
                                <SheetDescription>
                                    <div className="flex flex-col gap-6">
                                        <Link href="/" className="hover:scale-105 hover:font-semibold transition-transform duration-300"> Home
                                        </Link>
                                        <Link href="/dashboard" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                                            Dashboard
                                        </Link>
                                        {/* <Link href="/about" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                                            About
                                        </Link>
                                        <Link href="/team" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
                                            Team
                                        </Link> */}
                                        <div>
                                            <SignedIn>
                                                <UserButton />
                                            </SignedIn>

                                            <SignedOut >
                                                <div className='bg-black text-white p-2 rounded-lg'> <SignInButton /></div>
                                            </SignedOut>

                                        </div>
                                    </div>
                                </SheetDescription>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navbar