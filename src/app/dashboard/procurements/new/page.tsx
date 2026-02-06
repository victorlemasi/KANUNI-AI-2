"use client"

import { useState, useEffect } from "react"
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
    ClipboardCheck,
    Sparkles
} from "lucide-react"
import Link from "next/link"
import { analyzeDocumentAction } from "@/app/actions/analyze-document"
import { createProcurementAction } from "@/app/actions/procurement-actions"
import { cn } from "@/lib/utils"

type ComplianceCheck = {
    category: "Regulatory" | "Financial" | "Risk/Best Practice";
    rule: string;
    status: "Pass" | "Fail" | "Warning";
    finding: string;
    recommendation: string;
}

type ExtractedMetadata = {
    title: string;
    method: string;
    value: number;
    currency: string;
}

type AnalysisResult = {
    extractedMetadata: ExtractedMetadata;
    isCompliant: boolean;
    overall_compliance_score: number;
    summary: string;
    checks: ComplianceCheck[];
}

export default function NewProcurementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState<number>(0)
    const [formData, setLocalFormData] = useState({
        title: "",
        method: "Open Tender",
        value: "",
        currency: "KES",
        description: ""
    })
    const [aiProvider, setAiProvider] = useState<"genkit" | "openrouter">("genkit")

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else if (countdown === 0 && error && file && !analyzing) {
            // Auto-retry if it was a quota error
            if (error.includes("wait") || error.includes("Quota") || error.includes("limit")) {
                console.log("Cooldown expired. Auto-retrying analysis...")
                triggerAnalysis(file)
            }
        }
    }, [countdown, error, file, analyzing])

    const triggerAnalysis = async (selectedFile: File) => {
        setAnalyzing(true)
        setError(null)
        setAnalysisResult(null)

        const data = new FormData()
        data.append("file", selectedFile)
        data.append("provider", aiProvider)

        try {
            const result = await analyzeDocumentAction(data)
            if (result.success) {
                const analysis = result.analysis as AnalysisResult
                setAnalysisResult(analysis)

                // Auto-fill form from AI extraction
                setLocalFormData({
                    title: analysis.extractedMetadata.title || "",
                    method: analysis.extractedMetadata.method || "Open Tender",
                    value: analysis.extractedMetadata.value?.toString() || "",
                    currency: analysis.extractedMetadata.currency || "KES",
                    description: analysis.summary
                })
            } else {
                setError(result.error || "Analysis failed")
                // Parse retry time if available in error message
                const match = result.error?.match(/wait (\d+) seconds/i)
                if (match) {
                    setCountdown(parseInt(match[1]))
                }
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error occurred during analysis.")
        } finally {
            setAnalyzing(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            await triggerAnalysis(selectedFile)
        }
    }

    const removeFile = () => {
        setFile(null)
        setAnalysisResult(null)
        setError(null)
        setLocalFormData({
            title: "",
            method: "Open Tender",
            value: "",
            currency: "KES",
            description: ""
        })
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
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Document Analysis</h1>
                    <p className="text-zinc-500">Upload a document to automatically extract data and verify Kenyan law compliance.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* AI Provider Selection */}
                <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">Choose AI Provider</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setAiProvider("genkit")}
                            className={`p-6 rounded-xl border-2 transition-all ${
                                aiProvider === "genkit" 
                                    ? "border-zinc-900 bg-zinc-50" 
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                        >
                            <div className="text-left space-y-2">
                                <h3 className="font-bold text-zinc-900">Google Genkit</h3>
                                <p className="text-sm text-zinc-500">Google's AI models with specialized procurement analysis</p>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${aiProvider === "genkit" ? "bg-zinc-900" : "bg-zinc-300"}`} />
                                    <span className="text-xs text-zinc-400">Default Provider</span>
                                </div>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setAiProvider("openrouter")}
                            className={`p-6 rounded-xl border-2 transition-all ${
                                aiProvider === "openrouter" 
                                    ? "border-blue-600 bg-blue-50" 
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                        >
                            <div className="text-left space-y-2">
                                <h3 className="font-bold text-zinc-900">OpenRouter</h3>
                                <p className="text-sm text-zinc-500">Multiple AI models including Claude, GPT-4, and Llama</p>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${aiProvider === "openrouter" ? "bg-blue-600" : "bg-zinc-300"}`} />
                                    <span className="text-xs text-zinc-400">Advanced Options</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Step 1: Document Upload */}
                <section className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                            <Upload className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">1. Upload Document</h2>
                    </div>

                    {!file ? (
                        <div
                            className="border-2 border-dashed border-zinc-200 rounded-xl p-16 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer group"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-zinc-400 group-hover:text-zinc-900" />
                            </div>
                            <p className="text-xl font-black text-zinc-900">Select PDF, DOCX, or TXT</p>
                            <p className="text-sm text-zinc-500 mt-2 max-w-xs text-center leading-relaxed">
                                AI will automatically extract the procurement title, method, and value while auditing compliance.
                            </p>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-white shadow-md flex items-center justify-center">
                                    <File className="h-8 w-8 text-zinc-900" />
                                </div>
                                <div>
                                    <p className="text-base font-black text-zinc-900">{file.name}</p>
                                    <p className="text-sm text-zinc-400 font-medium">{(file.size / 1024).toFixed(1)} KB • Document Ready</p>
                                </div>
                            </div>
                            {!analyzing && (
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-3 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors rounded-full"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            )}
                            {analyzing && (
                                <div className="flex items-center gap-3 text-zinc-600 font-bold bg-white px-6 py-2 rounded-xl shadow-sm border border-zinc-100">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>AI Analysis...</span>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Step 2: Analysis & Form (Only shown when file is uploaded or analyzed) */}
                {(file || analysisResult) && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="space-y-8 lg:space-y-10 order-2 lg:order-1">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm space-y-10">
                                <section className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900">2. Review Extracted Data</h3>
                                        </div>
                                        {analysisResult && (
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                                AI PRE-FILLED
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid gap-8 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Procurement Title</label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={(e) => setLocalFormData({ ...formData, title: e.target.value })}
                                                type="text"
                                                className="w-full rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-zinc-100 transition-all placeholder:text-zinc-300"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Procurement Method</label>
                                            <select
                                                value={formData.method}
                                                onChange={(e) => setLocalFormData({ ...formData, method: e.target.value })}
                                                className="w-full rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-zinc-100 transition-all bg-white"
                                            >
                                                <option>Open Tender</option>
                                                <option>Restricted Tender</option>
                                                <option>Direct Procurement</option>
                                                <option>Request for Quotation</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Estimated Value</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">KES</span>
                                                <input
                                                    required
                                                    value={formData.value}
                                                    onChange={(e) => setLocalFormData({ ...formData, value: e.target.value })}
                                                    type="number"
                                                    className="w-full rounded-xl border border-zinc-200 pl-14 pr-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Summary</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setLocalFormData({ ...formData, description: e.target.value })}
                                                className="w-full rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-zinc-100 transition-all h-24 resize-none"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="flex items-center justify-end gap-6 p-10 bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-20 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                                <Link
                                    href="/dashboard/procurements"
                                    className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                                >
                                    Discard Request
                                </Link>
                                <button
                                    disabled={loading || analyzing}
                                    type="submit"
                                    className="flex items-center gap-3 rounded-2xl bg-white px-12 py-4 text-sm font-black text-zinc-900 shadow-xl hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            SAVING REPORT...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            SAVE ANALYSIS REPORT
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* AI Side Panel */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sticky top-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-zinc-900 tracking-tight">Audit Insights</h3>
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Financial & Regulatory</p>
                                    </div>
                                </div>

                                {analyzing ? (
                                    <div className="py-20 text-center space-y-8">
                                        <div className="relative h-24 w-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-zinc-50"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="h-8 w-8 text-zinc-200 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-zinc-900">AI is analyzing document...</p>
                                            <p className="text-xs text-zinc-400 font-medium">Verifying against Law & Best Practices</p>
                                        </div>
                                    </div>
                                ) : analysisResult ? (
                                    <div className="space-y-10">
                                        <div className="flex flex-col sm:flex-row items-center gap-8 py-8 px-6 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-inner">
                                            <div className="relative h-28 w-28 shrink-0">
                                                <svg className="h-full w-full" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-white"
                                                        strokeDasharray="100, 100"
                                                        strokeWidth="2.5"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className={analysisResult.overall_compliance_score > 70 ? "text-emerald-500" : analysisResult.overall_compliance_score > 40 ? "text-yellow-500" : "text-rose-500"}
                                                        strokeDasharray={`${analysisResult.overall_compliance_score}, 100`}
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-3xl font-black text-zinc-900">{analysisResult.overall_compliance_score}</span>
                                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Health</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-black text-zinc-900">Compliance Health</h4>
                                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                                    {analysisResult.overall_compliance_score > 70
                                                        ? "Strong alignment with PPADA 2015. Minimal risks detected."
                                                        : analysisResult.overall_compliance_score > 40
                                                            ? "Moderate risks found. Several warnings require attention."
                                                            : "High risk profile. Significant non-compliance detected."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Rule Violations & Findings</p>

                                            {(["Regulatory", "Financial", "Risk/Best Practice"] as const).map((cat) => {
                                                const catChecks = analysisResult.checks.filter(c => c.category === cat);
                                                if (catChecks.length === 0) return null;

                                                return (
                                                    <div key={cat} className="space-y-4">
                                                        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                                                            <div className={cn(
                                                                "h-1.5 w-1.5 rounded-full",
                                                                cat === "Regulatory" ? "bg-blue-500" : cat === "Financial" ? "bg-emerald-500" : "bg-purple-500"
                                                            )} />
                                                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cat}</h4>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {catChecks.map((check, idx) => (
                                                                <div key={idx} className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/30 hover:bg-zinc-50 transition-all group">
                                                                    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                                                                        <span className="text-xs font-black text-zinc-900 group-hover:text-zinc-950 transition-colors uppercase tracking-tight">{check.rule}</span>
                                                                        <span className={`shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${check.status === "Pass" ? "bg-emerald-100 text-emerald-700" :
                                                                            check.status === "Warning" ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"
                                                                            }`}>
                                                                            {check.status === "Pass" ? <CheckCircle className="h-3 w-3" /> : check.status === "Warning" ? <AlertTriangle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                                            {check.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="space-y-2">
                                                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Finding</span>
                                                                            <p className="text-[11px] text-zinc-600 leading-snug font-medium">
                                                                                {check.finding}
                                                                            </p>
                                                                        </div>
                                                                        <div className="space-y-2 bg-white/50 p-3 rounded-xl border border-zinc-100/50">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <ClipboardCheck className="h-3 w-3 text-zinc-300" />
                                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Recommendation</span>
                                                                            </div>
                                                                            <p className="text-[10px] text-zinc-500 italic leading-snug">
                                                                                {check.recommendation}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="py-20 text-center space-y-6">
                                        <div className="bg-rose-50 rounded-full h-16 w-16 mx-auto flex items-center justify-center shadow-inner">
                                            <AlertCircle className="h-8 w-8 text-rose-500" />
                                        </div>
                                        <div className="space-y-2 px-4">
                                            <p className="text-sm font-bold text-zinc-900">Analysis Failed</p>
                                            <p className="text-sm text-zinc-500 italic leading-relaxed font-medium">
                                                {error}
                                            </p>
                                            <div className="flex flex-col gap-3 pt-2">
                                                <button
                                                    disabled={countdown > 0}
                                                    onClick={() => file && triggerAnalysis(file)}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 mx-auto px-10 py-3 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95",
                                                        countdown > 0 ? "bg-zinc-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
                                                    )}
                                                >
                                                    {countdown > 0 ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            COOLDOWN: {countdown}S
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-3 w-3" />
                                                            RETRY ANALYSIS
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => document.getElementById('file-upload')?.click()}
                                                    className="text-[10px] font-black text-zinc-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                                                >
                                                    Try Another Document
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center space-y-6">
                                        <div className="bg-zinc-50 rounded-full h-16 w-16 mx-auto flex items-center justify-center shadow-inner">
                                            <Info className="h-8 w-8 text-zinc-200" />
                                        </div>
                                        <p className="text-sm text-zinc-400 italic leading-relaxed font-medium">
                                            Awaiting document upload to start compliance audit.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
