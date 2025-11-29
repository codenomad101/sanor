'use client'

import Navbar from '@/components/Navbar'
import { Heart } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-16 h-16 bg-sanor-purple/10 rounded-full flex items-center justify-center">
                            <Heart size={32} className="text-sanor-purple" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-sanor-black mb-8">About Us</h1>

                    <div className="bg-sanor-purple/5 rounded-3xl p-8 md:p-12 border border-sanor-purple/10">
                        <p className="text-xl md:text-2xl text-sanor-black leading-relaxed font-medium">
                            &ldquo;The site is created by Pratiksha Rathod to spread the love and joy of lifestyle.&rdquo;
                        </p>

                        <div className="mt-8 pt-8 border-t border-sanor-purple/10">
                            <p className="text-sanor-purple font-semibold">Pratiksha Rathod</p>
                            <p className="text-sm text-gray-500">Founder & Creator</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
