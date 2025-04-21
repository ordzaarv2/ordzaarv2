"use client"

import Link from "next/link"
import { useState } from "react"
import WalletConnect from "@/components/WalletConnect"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-border py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Ordzaar
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/collections" className="text-foreground hover:text-primary/80">
            Collections
          </Link>
          <Link href="/market-stats" className="text-foreground hover:text-primary/80">
            Market Stats
          </Link>
          <Link href="/create" className="text-foreground hover:text-primary/80">
            Create
          </Link>
          <Link href="/admin" className="text-foreground hover:text-primary/80">
            Admin
          </Link>
          <WalletConnect />
        </nav>
        
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <path d="M4 6 18 6 18 18" />
            ) : (
              <path d="M4 12h16M4 6h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden container mx-auto py-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/collections" className="text-foreground hover:text-primary/80">
              Collections
            </Link>
            <Link href="/market-stats" className="text-foreground hover:text-primary/80">
              Market Stats
            </Link>
            <Link href="/create" className="text-foreground hover:text-primary/80">
              Create
            </Link>
            <Link href="/admin" className="text-foreground hover:text-primary/80">
              Admin
            </Link>
            <div className="py-1">
              <WalletConnect />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 