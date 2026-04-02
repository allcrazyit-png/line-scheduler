"use client";

import { useState } from "react";
import {
    Settings,
    Sun,
    Moon,
    Monitor,
    Eye,
    EyeOff,
    Copy,
    Check,
    Save,
    Webhook,
    Key,
    Palette,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const THEME_OPTIONS = [
    { value: "light", label: "淺色模式", icon: Sun, desc: "使用明亮白色背景" },
    { value: "dark", label: "深色模式", icon: Moon, desc: "使用深色護眼背景" },
    { value: "system", label: "跟隨系統", icon: Monitor, desc: "自動偵測系統設定" },
] as const;

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [channelId, setChannelId] = useState("1234567890");
    const [channelSecret, setChannelSecret] = useState("abcdef0123456789abcdef01234567");
    const [showSecret, setShowSecret] = useState(false);
    const [webhookUrl] = useState("https://your-domain.com/api/webhook/line");
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const maskedSecret = channelSecret.replace(/./g, "•");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Settings size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-none mb-0.5">LINE Business</p>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">系統設定</h1>
                    </div>
                </div>
            </header>

            <div className="px-4 py-5 space-y-5 animate-slideUp">
                {/* Save Success Toast */}
                {saved && (
                    <div className="flex items-center gap-3 bg-[#06C755] text-white rounded-2xl px-4 py-3 shadow-lg animate-fadeIn">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Check size={14} />
                        </div>
                        <p className="text-sm font-semibold">設定已成功儲存！</p>
                    </div>
                )}

                {/* Theme Settings */}
                <section className="card overflow-hidden">
                    <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Palette size={14} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">主題設定</h2>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => {
                            const isActive = theme === value;
                            return (
                                <label
                                    key={value}
                                    htmlFor={`theme-${value}`}
                                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${isActive
                                            ? "bg-[#06C755]/5 dark:bg-[#06C755]/10"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive
                                                ? "bg-[#06C755] shadow-md"
                                                : "bg-gray-100 dark:bg-gray-800"
                                            }`}
                                    >
                                        <Icon
                                            size={19}
                                            className={isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${isActive ? "text-[#06C755]" : "text-gray-800 dark:text-gray-200"}`}>
                                            {label}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <input
                                            type="radio"
                                            id={`theme-${value}`}
                                            name="theme"
                                            value={value}
                                            checked={isActive}
                                            onChange={() => setTheme(value)}
                                            className="w-4 h-4 accent-[#06C755] cursor-pointer"
                                        />
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </section>

                {/* Account Settings */}
                <section className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Key size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">帳號資訊</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Channel ID */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                LINE Channel ID
                            </label>
                            <input
                                type="text"
                                value={channelId}
                                onChange={(e) => setChannelId(e.target.value)}
                                placeholder="輸入 Channel ID"
                                className="input-field font-mono"
                            />
                        </div>

                        {/* Channel Secret */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Channel Secret
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={showSecret ? channelSecret : maskedSecret}
                                    onChange={(e) => showSecret && setChannelSecret(e.target.value)}
                                    readOnly={!showSecret}
                                    placeholder="輸入 Channel Secret"
                                    className="input-field font-mono pr-12"
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#06C755] transition-colors"
                                >
                                    {showSecret ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                                <Key size={10} />
                                點擊眼睛圖示可顯示或隱藏 Secret
                            </p>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="line-btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            儲存變更
                        </button>
                    </div>
                </section>

                {/* Webhook Settings */}
                <section className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <Webhook size={14} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Webhook 設定</h2>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Webhook URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={webhookUrl}
                                readOnly
                                className="input-field flex-1 font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 cursor-default"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${copied
                                        ? "bg-[#06C755] text-white shadow-md"
                                        : "bg-[#06C755]/10 text-[#06C755] hover:bg-[#06C755] hover:text-white"
                                    }`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "已複製" : "複製"}
                            </button>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                💡 請將此 URL 填入 LINE Developers Console 的 Webhook URL 欄位並啟用 Webhook。
                            </p>
                        </div>
                    </div>
                </section>

                {/* App Version */}
                <div className="text-center pb-2">
                    <p className="text-xs text-gray-300 dark:text-gray-700 font-medium">LINE 訊息排程器 v1.1.0</p>
                    <p className="text-xs text-gray-300 dark:text-gray-700">© 2026 Built with Next.js & LINE API</p>
                </div>
            </div>
        </div>
    );
}
