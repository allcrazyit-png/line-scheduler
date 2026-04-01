"use client";
// deployment trigger for v1.0.1


import { useEffect, useState } from "react";
import {
    MessageSquarePlus,
    Users,
    Clock,
    ChevronDown,
    Send,
    Pencil,
    Trash2,
    Plus,
    Wifi,
    Calendar,
    FileText,
    Loader2,
} from "lucide-react";

interface QueueItem {
    id: string;
    group: string;
    message: string;
    scheduledAt: string;
    status: "pending" | "sent";
    repeatType?: "none" | "weekly" | "monthly";
    repeatValue?: string;
}

const TEMPLATES = [
    { label: "每週報告", text: "📊 本週工作報告\n\n本週工作摘要：\n- 項目進度：\n- 完成事項：\n- 下週計劃：" },
    { label: "會議提醒", text: "📅 會議提醒\n\n提醒您明日將有重要會議，請務必準時出席。\n\n時間：\n地點：\n議程：" },
    { label: "公告通知", text: "📢 重要公告\n\n敬請各位同仁注意以下事項：\n\n內容：\n\n如有疑問請聯絡相關負責人。" },
];


export default function DashboardPage() {
    const [selectedGroup, setSelectedGroup] = useState("");
    const [message, setMessage] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [repeatType, setRepeatType] = useState<"none" | "weekly" | "monthly">("none");
    const [repeatValue, setRepeatValue] = useState("");
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [groups, setGroups] = useState<{ name: string; id: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupName, setGroupName] = useState("");
    const [groupId, setGroupId] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchQueue();
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch("/api/groups");
            const data = await res.json();
            if (Array.isArray(data)) setGroups(data);
        } catch (err) {
            console.error("Fetch groups failed:", err);
        }
    };

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/schedule");
            const data = await res.json();
            if (Array.isArray(data)) {
                // 只顯示尚未發送的
                setQueue(data.filter((item: any) => item.status === "pending"));
            }
        } catch (err) {
            console.error("Fetch queue failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplate = (template: string) => {
        setMessage(template);
    };

    const handleSchedule = async () => {
        if (!selectedGroup) return alert("請選擇目標群組！");
        if (!message) return alert("請輸入訊息內容！");
        if (!scheduledDate) return alert("請選擇發送日期！");
        if (!scheduledTime) return alert("請選擇發送時間！");

        if (repeatType !== "none" && !repeatValue) {
            return alert(repeatType === "weekly" ? "請選擇每週重複的天數！" : "請選擇每月重複的日期！");
        }

        setLoading(true);
        try {
            const res = await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group: selectedGroup,
                    message,
                    scheduledAt: `${scheduledDate} ${scheduledTime}`,
                    repeatType,
                    repeatValue,
                }),
            });

            if (res.ok) {
                const newItem = await res.json();
                setQueue((prev) => [newItem, ...prev]);
                setMessage("");
                setSelectedGroup("");
                setScheduledDate("");
                setScheduledTime("");
                setRepeatType("none");
                setRepeatValue("");
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Schedule failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除此預約嗎？")) return;

        try {
            const res = await fetch(`/api/schedule/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setQueue((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleAddGroup = async () => {
        if (!groupName) return alert("請輸入群組名稱！");
        if (!groupId) return alert("請輸入群組 ID！");

        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: groupName, id: groupId }),
            });
            if (res.ok) {
                setGroups((prev) => [...prev, { name: groupName, id: groupId }]);
                setGroupName("");
                setGroupId("");
                alert("群組新增成功！");
            } else {
                const errData = await res.json();
                alert("新增失敗：" + (errData.error || "未知錯誤"));
            }
        } catch (err) {
            console.error("Add group failed:", err);
            alert("網路連線失敗，請稍後再試。");
        }
    };

    const handleDeleteGroup = async (name: string) => {
        if (!confirm(`確定要刪除群組「${name}」嗎？`)) return;
        try {
            const res = await fetch(`/api/groups/${encodeURIComponent(name)}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setGroups((prev) => prev.filter((g) => g.name !== name));
            }
        } catch (err) {
            console.error("Delete group failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[#06C755] rounded-xl flex items-center justify-center shadow-sm">
                            <MessageSquarePlus size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-none mb-0.5">LINE Business</p>
                            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">訊息排程器 <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 ml-1">v1.0.1</span></h1>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06C755] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06C755]" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#06C755] leading-none whitespace-nowrap">系統連線中</span>
                        <Wifi size={11} className="text-[#06C755]" />
                    </div>
                </div>
            </header>

            <div className="px-4 py-5 space-y-5 animate-slideUp">
                {/* Success Toast */}
                {showSuccess && (
                    <div className="flex items-center gap-3 bg-[#06C755] text-white rounded-2xl px-4 py-3 shadow-lg animate-fadeIn">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Send size={14} />
                        </div>
                        <p className="text-sm font-semibold">訊息已成功加入排程佇列！</p>
                    </div>
                )}

                {/* Create Message Section */}
                <section className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-[#06C755]/10 rounded-lg flex items-center justify-center">
                            <Send size={14} className="text-[#06C755]" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">建立訊息</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Group Selector */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                目標群組
                            </label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="input-field pl-10 pr-10 appearance-none"
                                >
                                    <option value="">請選擇目標群組</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Quick Templates */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                快速範本
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.label}
                                        onClick={() => handleTemplate(t.text)}
                                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg
                      bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                      hover:bg-[#06C755]/10 hover:text-[#06C755] dark:hover:bg-[#06C755]/20 dark:hover:text-[#06C755]
                      border border-gray-200 dark:border-gray-700 hover:border-[#06C755]/40
                      transition-all duration-150 active:scale-95"
                                    >
                                        <FileText size={12} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                訊息內容
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="輸入訊息內容..."
                                rows={4}
                                className="input-field resize-none"
                            />
                            <p className="text-right text-xs text-gray-400 mt-1">{message.length} 字元</p>
                        </div>

                        {/* Date Time Picker */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                    發送日期
                                </label>
                                <div className="relative">
                                    <Calendar className="hidden sm:block absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="input-field px-3 sm:pl-9 py-3 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                    發送時間
                                </label>
                                <div className="relative">
                                    <Clock className="hidden sm:block absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        className="input-field px-3 sm:pl-9 py-3 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 重複發送設定 */}
                        <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    重複發送
                                </label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                    {[
                                        { id: "none", label: "單次" },
                                        { id: "weekly", label: "每週" },
                                        { id: "monthly", label: "每月" }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setRepeatType(type.id as any)}
                                            className={`px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${
                                                repeatType === type.id
                                                    ? "bg-white dark:bg-gray-700 text-[#06C755] shadow-sm"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 每週特殊選擇 */}
                            {repeatType === "weekly" && (
                                <div className="flex flex-wrap gap-1.5 justify-between">
                                    {[
                                        { v: "1", l: "一" }, { v: "2", l: "二" }, { v: "3", l: "三" },
                                        { v: "4", l: "四" }, { v: "5", l: "五" }, { v: "6", l: "六" }, { v: "0", l: "日" }
                                    ].map((day) => (
                                        <button
                                            key={day.v}
                                            onClick={() => {
                                                const current = repeatValue.split(",").filter(Boolean);
                                                const next = current.includes(day.v)
                                                    ? current.filter(d => d !== day.v)
                                                    : [...current, day.v];
                                                setRepeatValue(next.sort().join(","));
                                            }}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all border ${
                                                repeatValue.split(",").includes(day.v)
                                                    ? "bg-[#06C755] border-[#06C755] text-white"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {day.l}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 每月特殊選擇 */}
                            {repeatType === "monthly" && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">每月第</span>
                                    <select
                                        value={repeatValue}
                                        onChange={(e) => setRepeatValue(e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-xs outline-none text-[#06C755]"
                                    >
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d.toString()}>{d}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-gray-500">號發送</span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSchedule}
                            className="line-btn-primary w-full flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={17} className="animate-spin" />
                            ) : (
                                <Clock size={17} />
                            )}
                            {loading ? "處理中..." : "預約訊息"}
                        </button>
                    </div>
                </section>

                {/* Queue Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">待發送佇列</h2>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                            {queue.length} 則
                        </span>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="card p-8 text-center bg-white/50 dark:bg-gray-900/50">
                                <Loader2 size={32} className="mx-auto text-[#06C755] animate-spin mb-3" />
                                <p className="text-sm text-gray-400">載入中...</p>
                            </div>
                        ) : queue.length === 0 ? (
                            <div className="card p-8 text-center">
                                <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">目前沒有排程中的訊息</p>
                            </div>
                        ) : (
                            queue.map((item) => (
                                <div key={item.id} className="card p-4 animate-fadeIn">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 bg-[#06C755]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MessageSquarePlus size={16} className="text-[#06C755]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.group}</p>
                                                    <span className="badge-pending">待處理</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.message}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={11} />
                                                        <span>{item.scheduledAt}</span>
                                                    </div>
                                                    {item.repeatType && item.repeatType !== "none" && (
                                                        <span className="text-[10px] bg-[#06C755]/10 text-[#06C755] px-1.5 py-0.5 rounded border border-[#06C755]/20 font-medium">
                                                            {item.repeatType === "weekly" ? "每週重複" : "每月重複"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors">
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Manage Groups */}
                <section className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Users size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">管理群組</h2>
                    </div>

                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">新增 LINE 群組</p>

                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="群組名稱"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder="群組 ID（例：C1234567890）"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            className="input-field font-mono text-sm"
                        />
                        <button
                            onClick={handleAddGroup}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl
                border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400
                hover:border-[#06C755] hover:text-[#06C755] active:scale-95 transition-all duration-200"
                        >
                            <Plus size={16} />
                            新增群組
                        </button>
                    </div>

                    {/* Existing Groups List */}
                    <div className="mt-4 space-y-2">
                        {groups.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-4">尚未建立任何群組</p>
                        ) : (
                            groups.map((g) => (
                                <div key={g.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-[#06C755]/10 rounded-lg flex items-center justify-center">
                                            <Users size={13} className="text-[#06C755]" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">{g.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{g.id}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGroup(g.name)}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
