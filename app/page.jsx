"use client";

import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";
import UsernameForm from "@/components/UsernameForm";
import { Particles } from "@/components/magicui/particles";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ClientLayout from "@/components/ClientLayout";
import { Toaster, toast } from "sonner";

function PageContent() {
  const { t } = useTranslation();
  const [isSliding, setIsSliding] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [finalizationProgress, setFinalizationProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTrainingComplete, setIsTrainingComplete] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleRoastComplete = () => {
      setShouldRedirect(true);
    };

    const handleRoastError = () => {
      setHasApiError(true);

      setShowLoadingPage(false);
      setIsSliding(false);
      setLoadingStep(0);
      setTrainingCount(0);
      setFinalizationProgress(0);
      setIsInitialized(false);
      setIsTrainingComplete(false);
      setIsStuck(false);
    };

    const handleResetHomepage = () => {
      setIsSliding(false);
      setShowLoadingPage(false);
      setShouldRedirect(false);
      setHasApiError(false);
      setLoadingStep(0);
      setTrainingCount(0);
      setFinalizationProgress(0);
      setIsInitialized(false);
      setIsTrainingComplete(false);
      setIsStuck(false);
    };

    window.addEventListener('roastComplete', handleRoastComplete);
    window.addEventListener('roastError', handleRoastError);
    window.addEventListener('resetHomepage', handleResetHomepage);

    return () => {
      window.removeEventListener('roastComplete', handleRoastComplete);
      window.removeEventListener('roastError', handleRoastError);
      window.removeEventListener('resetHomepage', handleResetHomepage);
    };
  }, []);

  useEffect(() => {
    if (shouldRedirect && finalizationProgress >= 100) {
      setTimeout(() => {
        window.location.href = '/roast';
      }, 1000);
    }
  }, [shouldRedirect, finalizationProgress]);

  const handleFormSubmit = () => {
    setIsSliding(true);
    setTimeout(() => {
      setShowLoadingPage(true);
      startLoadingSequence();
    }, 800);
  };

  const startLoadingSequence = () => {
    setTimeout(() => {
      setIsInitialized(true);
      setLoadingStep(1);
      startTraining();
    }, 2300);
  };

  const startTraining = () => {
    const targetCount = 79032;
    const duration = 12000;
    const startTime = Date.now();
    
    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentCount = Math.floor(targetCount * progress);
      
      setTrainingCount(currentCount);
      
      if (progress < 1) {
        setTimeout(updateCount, 50);
      } else {
        setTrainingCount(targetCount);
        setIsTrainingComplete(true);
        setTimeout(() => {
          setLoadingStep(2);
          startFinalization();
        }, 1300);
      }
    };
    
    updateCount();
  };

  const startFinalization = () => {
    const duration = 15600; // 30% slower (12000 * 1.3)
    const startTime = Date.now();
    let speedMultiplier = 1;
    let lastShouldRedirect = false;
    let isFinishing = false;
    let finishStartTime = 0;
    let isStuckAt90 = false;

    const isResponseReceived = () => {
      return localStorage.getItem('roastData') !== null;
    };
    
    const updateProgress = () => {
      const responseReceived = isResponseReceived() || shouldRedirect;

      if (responseReceived && !lastShouldRedirect) {
        lastShouldRedirect = true;
        isFinishing = true;
        finishStartTime = Date.now();
      }
      
      let progress;
      
      if (isFinishing) {
        const finishElapsed = Date.now() - finishStartTime;
        const finishDuration = 1040;

        const currentProgress = finalizationProgress / 100;

        const t = Math.min(finishElapsed / finishDuration, 1);
        const easeOutQuad = t * (2 - t); // Ease out quadratic formula

        progress = currentProgress + (1 - currentProgress) * easeOutQuad;
      } else {
        const elapsed = Date.now() - startTime;
        let adjustedElapsed = elapsed * speedMultiplier;
        progress = Math.min(adjustedElapsed / duration, 1);

        if (progress >= 0.5 && !responseReceived) {
          if (progress < 0.9) {
            const slowZoneStart = 0.5;
            const slowZoneEnd = 0.9;
            const slowZoneProgress = (progress - slowZoneStart) / (slowZoneEnd - slowZoneStart);

            const slowMultiplier = 0.3;
            const adjustedSlowProgress = slowZoneProgress * slowMultiplier;
            progress = slowZoneStart + adjustedSlowProgress * (slowZoneEnd - slowZoneStart);
          } else if (progress >= 0.9 && !isStuckAt90) {
            progress = 0.9;
            isStuckAt90 = true;
            setIsStuck(true);
          }
        }
      }

      setFinalizationProgress(Math.floor(progress * 100));
      
      if (progress >= 1) {
        if (!responseReceived && !hasApiError) {
          setIsStuck(true);
          return;
        }
        return;
      }
      
      if (progress < 1 && !(isStuckAt90 && !responseReceived)) {
        const updateInterval = isFinishing ? 16 : (speedMultiplier > 1 ? 20 : 50);
        setTimeout(updateProgress, updateInterval);
      }
    };
    
    updateProgress();
  };

  useEffect(() => {
    if (hasApiError) {
      // toast.error('Failed to generate roast. Please try again.');
      setTimeout(() => {
        setShowLoadingPage(false);
        setIsSliding(false);
        setLoadingStep(0);
        setTrainingCount(0);
        setFinalizationProgress(0);
        setIsInitialized(false);
        setIsTrainingComplete(false);
        setIsStuck(false);
        setHasApiError(false);
        setShouldRedirect(false);
      }, 4000);
    }
  }, [hasApiError]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Toaster theme="light" position="bottom-right" richColors />
      <div className="fixed top-4 sm:block hidden left-4 z-50">
        <LanguageSwitcher />
      </div>

      <div
        className={`relative min-h-screen flex flex-col transition-transform duration-500 ease-in-out ${
          isSliding ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="absolute top-4 backdrop-blur-3xl ml-4 right-4 opacity-90 max-w-md">
            <div className="bg-black/3 border border-[#dadada] text-black/80 text-sm sm:text-base font-mono px-4 py-3 rounded-lg shadow-lg shadow-black/4">
              <div className="flex items-end space-x-2 mb-2">
                <Terminal className="w-4 h-4 text-black/70" />
                <span className="text-xs tracking-wider font-medium unselectable">
                  {t("warning.title")}
                </span>
              </div>
              <div className="h-px bg-black/20 mb-2"></div>
              <p className="text-xs sm:text-sm font-mono unselectable leading-relaxed">
                {t("warning.message")}
              </p>
            </div>
          </div>

          <div className="max-w-2xl mb-24 mt-10 sm:mb-0 sm:mt-0 w-full text-center">
            <h1 className="font-merri text-[2.6rem] unselectable sm:text-6xl md:text-7xl lg:text-7xl font-light tracking-tight text-black mb-4 sm:mb-5 leading-[1.09]">
              {t("title")}
            </h1>

            <p className="font-merri unselectable text-lg sm:text-xl md:text-2xl font-light text-black/70 mb-8 sm:mb-8 md:mb-8 max-w-2xl mx-auto leading-[1.4] px-2 sm:px-0">
              {t("subtitle")}
            </p>

            <UsernameForm onSubmitComplete={handleFormSubmit} />

            <p className="font-pop unselectable text-xs sm:text-sm text-black/40 mt-8 sm:mt-12 tracking-wide px-4 sm:px-0">
              {t("footer")}
            </p>

            <Particles
              className="fixed inset-0 -z-10"
              quantity={80}
              ease={50}
              color={"#000000"}
              size={0.5}
              refresh
            />
          </div>
        </div>

        <Footer />
      </div>

      <div
        className={`fixed inset-0 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center transition-transform duration-700 ease-in-out ${
          showLoadingPage ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="text-center max-w-3xl unselectable w-full px-8">
          <div className="mb-12">
            <h2 className="font-merri text-3xl sm:text-4xl font-light text-black mb-3 tracking-tight">
              Analyzing Your Profile
            </h2>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-2xl shadow-black/5 max-w-2xl mx-auto">
            <div className="space-y-6 font-mono text-sm">

              <div className="text-left group">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    loadingStep >= 0 && isInitialized 
                      ? "bg-green-500 shadow-sm shadow-green-500/50" 
                      : "bg-gray-300 animate-pulse"
                  }`}></div>
                  <span className="text-black/80 font-medium">
                    {loadingStep >= 0 && isInitialized ? "✓" : "●"} Extracting behavioral data from your Reddit footprint...
                  </span>
                </div>
              </div>

              <div className={`text-left group transition-all duration-700 ease-out ${
                loadingStep >= 1 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4"
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    isTrainingComplete 
                      ? "bg-green-500 shadow-sm shadow-green-500/50" 
                      : "bg-orange-500 animate-pulse shadow-sm shadow-orange-500/50"
                  }`}></div>
                  <span className="text-black/80 font-medium">
                    {isTrainingComplete ? "✓" : "●"} Training on {trainingCount.toLocaleString()} behavioral patterns...
                  </span>
                </div>

                {loadingStep === 1 && (
                  <div className="mt-4 ml-5">
                    <div className="relative">
                      <div className="flex space-x-0.5 mb-2">
                        {[...Array(60)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-2 rounded-full transition-all duration-200 ${
                              i < (trainingCount / 79032) * 60
                                ? "bg-gradient-to-t from-orange-400 to-orange-500 shadow-sm"
                                : "bg-gray-200"
                            }`}
                            style={{
                              transitionDelay: `${i * 10}ms`
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-orange-600/70 font-medium">
                        {((trainingCount / 79032) * 100).toFixed(1)}% complete
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`text-left group transition-all duration-700 ease-out ${
                loadingStep >= 2 
                  ? "opacity-100" 
                  : "opacity-0"
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    finalizationProgress >= 100 
                      ? "bg-green-500 shadow-sm shadow-green-500/50" 
                      : "bg-blue-500 animate-pulse shadow-sm shadow-blue-500/50"
                  }`}></div>
                  <span className="text-black/80 font-medium">
                    {finalizationProgress >= 100 ? "✓" : "●"} Generating personalized roast...
                  </span>
                </div>

                <div className="mt-4 ml-5">
                  <div className="relative">
                    <div className="flex space-x-0.5 mb-2">
                      {[...Array(50)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-2 rounded-full transition-all duration-150 ${
                            i < (finalizationProgress / 100) * 50
                              ? "bg-gradient-to-t from-blue-400 to-blue-500 shadow-sm"
                              : "bg-gray-200"
                          }`}
                          style={{
                            transitionDelay: `${i * 8}ms`
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-blue-600/70 font-medium">
                      {finalizationProgress}% complete
                    </div>
                  </div>
                </div>
              </div>

              {!isInitialized && (
                <div className="mt-8 flex justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-black"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-black animate-ping opacity-20"></div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mt-8 text-xs text-black/40 font-mono tracking-wide">
            This may take a few moments...
          </div>
        </div>

        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientLayout>
      <PageContent />
    </ClientLayout>
  );
}
