"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Send,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Users,
    Loader2,
} from "lucide-react";

interface HistoryRecord {
    id: string;
    sender: string;
    group: string;
    message: string;
    status: "success" | "failed";
    scheduledAt: string;
    sentAt: string;
}

const ITEMS_PER_PAGE = 4;

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/history");
            const data = await res.json();
            if (Array.isArray(data)) {
                setHistory(data.reverse()); // 最新顯示在最前
            }
        } catch (err) {
            console.error("Fetch history failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = history.filter((r) => {
        const matchSearch =
            !search ||
            r.group.toLowerCase().includes(search.toLowerCase()) ||
            r.message.toLowerCase().includes(search.toLowerCase());

        const matchStart = !startDate || r.scheduledAt >= startDate;
        const matchEnd = !endDate || r.scheduledAt <= endDate + " 23:59";

        return matchSearch && matchStart && matchEnd;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const successCount = filtered.filter((r) => r.status === "success").length;
    const failedCount = filtered.filter((r) => r.status === "failed").length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-none mb-0.5">LINE Business</p>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">訊息發送紀錄</h1>
                    </div>
                </div>
            </header>

            <div className="px-4 py-5 space-y-4 animate-slideUp">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.length}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">總計</p>
                    </div>
                    <div className="card p-3 text-center">
                        <p className="text-2xl font-bold text-[#06C755]">{successCount}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">成功</p>
                    </div>
                    <div className="card p-3 text-center">
                        <p className="text-2xl font-bold text-red-500">{failedCount}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">失敗</p>
                    </div>
                </div>

                {/* Filter Section */}
                <section className="card p-4 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜尋群組名稱或訊息內容..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                placeholder="開始日期"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="input-field pl-9 text-sm"
                            />
                        </div>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                placeholder="結束日期"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="input-field pl-9 text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Records */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="card p-10 text-center bg-white/50 dark:bg-gray-900/50">
                            <Loader2 size={36} className="mx-auto text-[#06C755] animate-spin mb-3" />
                            <p className="text-sm font-semibold text-gray-400">紀錄載入中...</p>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="card p-10 text-center">
                            <MessageSquare size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">找不到符合的紀錄</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">試試調整篩選條件</p>
                        </div>
                    ) : (
                        paginated.map((record) => (
                            <div key={record.id} className="card p-4 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${record.status === "success"
                                            ? "bg-[#06C755]/10"
                                            : "bg-red-100 dark:bg-red-900/20"
                                            }`}
                                    >
                                        <Send
                                            size={17}
                                            className={record.status === "success" ? "text-[#06C755]" : "text-red-500"}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Header row */}
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{record.group}</span>
                                            </div>
                                            {record.status === "success" ? (
                                                <span className="badge-success flex items-center gap-1 flex-shrink-0">
                                                    <CheckCircle2 size={10} /> 成功
                                                </span>
                                            ) : (
                                                <span className="badge-failed flex items-center gap-1 flex-shrink-0">
                                                    <XCircle size={10} /> 失敗
                                                </span>
                                            )}
                                        </div>

                                        {/* Sender */}
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Users size={11} className="text-gray-400" />
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{record.sender}</span>
                                        </div>

                                        {/* Message Preview */}
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed bg-gray-50 dark:bg-gray-800/70 rounded-lg px-3 py-2">
                                            {record.message}
                                        </p>

                                        {/* Time Info */}
                                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={11} className="text-gray-400" />
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">預約：{record.scheduledAt}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Send size={11} className="text-gray-400" />
                                                <span className="text-[11px] text-gray-400 dark:text-gray-500">送出：{record.sentAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between card px-4 py-3">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:text-[#06C755] disabled:hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={16} />
                            上一頁
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === i + 1
                                        ? "bg-[#06C755] text-white shadow-sm"
                                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-30 hover:text-[#06C755] disabled:hover:text-gray-600 transition-colors"
                        >
                            下一頁
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
