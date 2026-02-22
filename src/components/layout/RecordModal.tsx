'use client';

import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: {
        label: string;
        name: string;
        type: 'text' | 'number' | 'date' | 'select' | 'textarea';
        options?: string[];
        placeholder?: string;
        defaultValue?: any;
    }[];
    onSubmit: (data: any) => void;
}

export function RecordModal({ isOpen, onClose, title, fields, onSubmit }: RecordModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0c0e0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 shadow-[0_0_8px_rgba(192,38,211,0.5)]" />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data = Object.fromEntries(formData.entries());
                        onSubmit(data);
                    }}
                    className="p-5 md:p-8 space-y-6 overflow-y-auto custom-scrollbar"
                >
                    <div className="grid grid-cols-1 gap-6">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                    {field.label}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        required
                                        defaultValue={field.defaultValue || ""}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-[2px] px-4 py-2 text-[11px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 transition-all appearance-none uppercase tracking-wider"
                                    >
                                        <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
                                        {field.options?.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        defaultValue={field.defaultValue}
                                        rows={3}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-[2px] px-4 py-2 text-[11px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 uppercase tracking-wider"
                                    />
                                ) : (['text', 'number', 'date'].includes(field.type)) ? (
                                    <input
                                        type={field.type as any}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        defaultValue={field.defaultValue}
                                        required
                                        min={field.type === 'number' ? 0 : undefined}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-[2px] px-4 py-2 text-[11px] font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 uppercase tracking-wider mono"
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Cancel_Entry
                        </button>
                        <button
                            type="submit"
                            className="btn-premium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        >
                            COMMIT_CHANGES
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
