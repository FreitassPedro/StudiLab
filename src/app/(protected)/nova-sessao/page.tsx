"use client";

import React, { Suspense } from "react";
import { SessionSidebar } from "./components/SessionSidebar";
import { StudySessionForm } from "./components/StudySessionForm";
import { TodayTimeline } from "./components/TodayTimeline";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";

export default function NovaSessaoPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-1 relative">
                <div className="flex-1 scroll-smooth overflow-auto">
                    <main className="flex-1 ">
                        <div className="md:col-span-2">
                            <StudySessionForm />
                        </div>
                        {/* Temporariamente desabilitada
                        <Suspense fallback={<div className="p-4">Carregando timeline...</div>}>
                            <TodayTimeline />
                        </Suspense>
                        */}
                    </main>
                </div>
                {/* Sidebar - Hidden on mobile, visible on lg+ */}
                <aside className={`
                    fixed lg:static bottom-0 lg:top-auto lg:h-full
                    w-full lg:w-72 h-auto 
                    bg-card border-t lg:border-t-0 lg:border-l border-border
                    flex flex-col
                    transform transition-transform duration-300
                    lg:translate-y-0 lg:z-0 z-40
                    ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                `}>
                    <div className='lg:hidden flex items-center justify-between p-4 border-b border-border'>
                        <h3 className="text-sm font-semibold">Informações</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <Suspense fallback={<div className="p-4">Carregando informações...</div>}>
                        <SessionSidebar />
                    </Suspense>
                </aside>
                <Button
                    variant="outline"
                    size="icon"
                    className='lg:hidden fixed bottom-6 right-6 w-12 h-12 z-50 rounded-full shadow-lg'
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <History className="w-12 h-12" />
                </Button>

            </div>
        </div>
    );
}