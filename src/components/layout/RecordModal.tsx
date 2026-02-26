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
                <div className="bg-background border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
                            {title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-primary transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
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
                                            className="w-full bg-background border border-border rounded-[2px] px-4 py-2 text-[11px] font-bold text-foreground focus:outline-none focus:border-primary transition-all appearance-none uppercase tracking-wider"
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
                                            className="w-full bg-background border border-border rounded-[2px] px-4 py-2 text-[11px] font-bold text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-zinc-500 uppercase tracking-wider"
                                        />
                                    ) : (['text', 'number', 'date'].includes(field.type)) ? (
                                        <input
                                            type={field.type as any}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            defaultValue={field.defaultValue}
                                            required
                                            min={field.type === 'number' ? 0 : undefined}
                                            className="w-full bg-background border border-border rounded-[2px] px-4 py-2 text-[11px] font-bold text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-zinc-500 uppercase tracking-wider mono"
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
                                className="btn-premium"
                            >
                                COMMIT_CHANGES
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
