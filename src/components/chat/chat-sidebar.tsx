"use client";

import { cn } from "@/lib/utils";
import { Plus, MessageSquare, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ChatSidebarProps {
    className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.div
            className={cn(
                "h-full bg-[#09090b] border-r border-white/5 flex flex-col transition-all duration-300 relative",
                collapsed ? "w-[60px]" : "w-[260px]",
                className
            )}
            initial={false}
            animate={{ width: collapsed ? 60 : 260 }}
        >
            <div className="p-3 flex items-center justify-between">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>

                {!collapsed && (
                    <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-auto">
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-2">
                {!collapsed && (
                    <div className="px-2 text-xs font-medium text-white/40 mb-2 mt-2 uppercase tracking-wider">Today</div>
                )}

                {[1, 2, 3].map((i) => (
                    <button
                        key={i}
                        className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors text-left group",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                            <span className="truncate">Conversation Topic {i}...</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="p-2 border-t border-white/5 space-y-1">
                <button
                    className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg text-sm text-white/70 hover:bg-white/5 transition-colors",
                        collapsed && "justify-center"
                    )}
                >
                    <Settings className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </button>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer mt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 shrink-0" />
                    {!collapsed && (
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">User Name</div>
                            <div className="text-xs text-white/40 truncate">Free Plan</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
