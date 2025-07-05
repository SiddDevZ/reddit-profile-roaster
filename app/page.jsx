'use client'

import React, { useState } from 'react'

const page = () => {
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      console.log('Roasting user:', username)
      // Add your roasting logic here
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="font-merri text-[2.8rem] sm:text-6xl md:text-7xl lg:text-7xl font-light tracking-tight text-black mb-4 sm:mb-6 leading-[1.09]">
          Reddit's Not a Safe Space Anymore.
        </h1>

        <p className="font-merri text-lg sm:text-xl md:text-2xl font-light text-black/70 mb-8 sm:mb-12 md:mb-14 max-w-2xl mx-auto leading-[1.4] px-2 sm:px-0">
          Enter your username and witness the art of digital destruction. Our
          sophisticated A.I roasts you by your comments and posts.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto px-2 sm:px-0">
            <div className="flex-1 border rounded-sm relative">
              <span className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-base sm:text-lg font-pop text-black/60 pointer-events-none">
                u/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Reddit username"
                className="w-full bg-white/60 outline-none text-lg sm:text-xl font-pop text-black placeholder-black/50 py-3 sm:py-[13.5px] pl-[2.33rem] sm:pl-12 pr-4 sm:pr-6 rounded-lg transition-all duration-200 focus:bg-white/70 focus:shadow-md"
              />
            </div>
            <button
              type="submit"
              disabled={!username.trim()}
              className="bg-[#272727] text-white cursor-pointer font-pop font-medium text-lg sm:text-xl py-3 sm:py-[13.5px] px-6 sm:px-7 rounded-lg transition-all duration-200 hover:bg-black/90 disabled:bg-black/50 disabled:cursor-not-allowed shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Roast
            </button>
          </div>
        </form>

        <p className="font-pop text-xs sm:text-sm text-black/40 mt-8 sm:mt-12 tracking-wide px-4 sm:px-0">
          Crafted with precision. Delivered without mercy.
        </p>
      </div>
    </div>
  )
}

export default page
