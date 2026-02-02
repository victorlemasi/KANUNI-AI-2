"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Loader2,
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    ShieldCheck,
    ClipboardCheck
} from "lucide-react"
import Link from "next/link"
import { analyzeDocumentAction } from "@/app/actions/analyze-document"
import { createProcurementAction } from "@/app/actions/procurement-actions"

type ComplianceCheck = {
    rule: string;
    status: "Pass" | "Fail" | "Warning";
    finding: string;
    recommendation: string;
}

type AnalysisResult = {
    isCompliant: boolean;
    complianceScore: number;
    summary: string;
    checks: ComplianceCheck[];
}

export default function NewProcurementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [formData, setLocalFormData] = useState({
        title: "",
        method: "Open Tender",
        value: "",
        currency: "USD"
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            setAnalyzing(true)
            const data = new FormData()
            data.append("file", selectedFile)
            data.append("title", formData.title)
            data.append("method", formData.method)
            data.append("value", formData.value)

            try {
                const result = await analyzeDocumentAction(data)
                if (result.success) {
                    setAnalysisResult(result.analysis as AnalysisResult)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setAnalyzing(false)
            }
        }
    }

    const removeFile = () => {
        setFile(null)
        setAnalysisResult(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await createProcurementAction({
                ...formData,
                value: Number(formData.value),
                analysis: analysisResult
            })
            if (result.success) {
                router.push("/dashboard/procurements")
            } else {
                alert("Error saving: " + result.error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/procurements"
                    className="rounded-full border border-zinc-200 bg-white p-2 hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New Procurement</h1>
                    <p className="text-zinc-500">Initiate a new procurement process with integrated AI document analysis.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-10">
                    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-8">
                        <section className="space-y-6">
                            <h3 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Basic Information</h3>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Procurement Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setLocalFormData({ ...formData, title: e.target.value })}
                                        type="text"
                                        placeholder="e.g. Supply of IT Infrastructure"
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Procurement Method</label>
                                    <select
                                        value={formData.method}
                                        onChange={(e) => setLocalFormData({ ...formData, method: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all bg-white"
                                    >
                                        <option>Open Tender</option>
                                        <option>Restricted Tender</option>
                                        <option>Direct Procurement</option>
                                        <option>Request for Quotation</option>
                                    </select>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-bold text-zinc-700">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Provide detailed scope of work..."
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 pt-4">
                            <h3 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Financials & Vendor</h3>
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Estimated Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                                        <input
                                            required
                                            value={formData.value}
                                            onChange={(e) => setLocalFormData({ ...formData, value: e.target.value })}
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-zinc-200 pl-8 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setLocalFormData({ ...formData, currency: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all bg-white"
                                    >
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>UGX</option>
                                        <option>KES</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Vendor (Search)</label>
                                    <input
                                        type="text"
                                        placeholder="Tax ID or Name"
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 pt-4">
                            <h3 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Procurement Documents</h3>
                            <div className="space-y-4">
                                {!file ? (
                                    <div
                                        className="border-2 border-dashed border-zinc-200 rounded-xl p-10 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group"
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <div className="h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <p className="text-base font-bold text-zinc-900">Upload Tender Document</p>
                                        <p className="text-sm text-zinc-500 mt-2">Gemini AI will automatically extract and analyze its compliance.</p>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                                                <File className="h-6 w-6 text-zinc-900" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">{file.name}</p>
                                                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB • PDF Document</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="p-2 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors rounded-full"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="flex items-center justify-end gap-4 p-8 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
                        <Link
                            href="/dashboard/procurements"
                            className="px-6 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            Discard Request
                        </Link>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-10 py-3 text-sm font-bold text-white shadow-xl hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Initiate Procurement
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">AI Analyzer</h3>
                                <p className="text-xs text-zinc-500">Document Compliance Health</p>
                            </div>
                        </div>

                        {!file ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="bg-zinc-50 rounded-full h-16 w-16 mx-auto flex items-center justify-center">
                                    <Info className="h-8 w-8 text-zinc-300" />
                                </div>
                                <p className="text-sm text-zinc-400 italic leading-relaxed">
                                    Upload a procurement document to see the real-time AI compliance analyzer in action.
                                </p>
                            </div>
                        ) : analyzing ? (
                            <div className="py-12 text-center space-y-6">
                                <div className="relative h-20 w-20 mx-auto">
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-zinc-900">Gemini is analyzing...</p>
                                    <p className="text-xs text-zinc-400">Extracting text and verifying rules</p>
                                </div>
                            </div>
                        ) : analysisResult ? (
                            <div className="space-y-8">
                                <div className="flex items-center justify-center py-4">
                                    <div className="relative h-32 w-32">
                                        <svg className="h-full w-full" viewBox="0 0 36 36">
                                            <path
                                                className="text-zinc-100"
                                                strokeDasharray="100, 100"
                                                strokeWidth="3"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className={analysisResult.complianceScore > 70 ? "text-emerald-500" : analysisResult.complianceScore > 40 ? "text-yellow-500" : "text-rose-500"}
                                                strokeDasharray={`${analysisResult.complianceScore}, 100`}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-zinc-900">{analysisResult.complianceScore}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Health</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border ${analysisResult.isCompliant ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"
                                    }`}>
                                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${analysisResult.isCompliant ? "text-emerald-700" : "text-rose-700"
                                        }`}>
                                        AI Summary
                                    </p>
                                    <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                                        {analysisResult.summary}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rule-by-rule Analysis</p>
                                    <div className="space-y-3">
                                        {analysisResult.checks.map((check, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors cursor-default">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-zinc-900">{check.rule}</span>
                                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${check.status === "Pass" ? "bg-emerald-100 text-emerald-700" :
                                                        check.status === "Warning" ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"
                                                        }`}>
                                                        {check.status === "Pass" ? <CheckCircle className="h-3 w-3" /> : check.status === "Warning" ? <AlertTriangle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                        {check.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-600 leading-normal mb-2">
                                                    {check.finding}
                                                </p>
                                                <div className="flex items-start gap-2 pt-2 border-t border-zinc-100">
                                                    <ClipboardCheck className="h-3 w-3 text-zinc-400 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] text-zinc-500 italic">
                                                        {check.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-xl border-2 border-dashed border-zinc-200 p-6 text-center bg-zinc-50/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-zinc-400" />
                            <span className="text-xs font-bold text-zinc-500 uppercase">Expert Mode</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Analysis is generated by Gemini 1.5 Flash using context from the current form data and the uploaded document text.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    )
}
