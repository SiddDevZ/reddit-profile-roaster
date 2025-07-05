'use client';

import React from 'react'
import { Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UsernameForm from "@/components/UsernameForm";
import { Particles } from "@/components/magicui/particles";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ClientLayout from "@/components/ClientLayout";

function PageContent() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      
      <div className="absolute top-4  left-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="absolute top-4 right-4 opacity-90 max-w-md">
        <div className="bg-black/3 border border-[#dadada] text-black/80 text-sm sm:text-base font-mono px-4 py-3 rounded-lg shadow-lg shadow-black/4">
          <div className="flex items-end space-x-2 mb-2">
            <Terminal className="w-4 h-4 text-black/70" />
            <span className="text-xs tracking-wider font-medium unselectable">{t('warning.title')}</span>
          </div>
          <div className="h-px bg-black/20 mb-2"></div>
          <p className="text-xs sm:text-sm font-mono unselectable leading-relaxed">
            {t('warning.message')}
          </p>
        </div>
      </div>

      <div className="max-w-2xl w-full text-center flex-1 flex flex-col justify-center">
        <h1 className="font-merri text-[2.6rem] unselectable sm:text-6xl md:text-7xl lg:text-7xl font-light tracking-tight text-black mb-4 sm:mb-5 leading-[1.09]">
          {t('title')}
        </h1>

        <p className="font-merri unselectable text-lg sm:text-xl md:text-2xl font-light text-black/70 mb-8 sm:mb-8 md:mb-8 max-w-2xl mx-auto leading-[1.4] px-2 sm:px-0">
          {t('subtitle')}
        </p>

        <UsernameForm />

        <p className="font-pop unselectable text-xs sm:text-sm text-black/40 mt-8 sm:mt-12 tracking-wide px-4 sm:px-0">
          {t('footer')}
        </p>
      </div>
      <Footer />
      <Particles
          className="absolute -z-1 inset-0"
          quantity={80}
          ease={50}
          color={"#000000"}
          size={0.5}
          refresh
        />
    </div>
  )
}

export default function Page() {
  return (
    <ClientLayout>
      <PageContent />
    </ClientLayout>
  )
}
