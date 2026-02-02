"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { analyzeDocumentAction } from "@/app/actions/analyze-document"

export default function NewProcurementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [analysisResult, setAnalysisResult] = useState<{ isCompliant: boolean, findings: string[] } | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            setAnalyzing(true)
            const formData = new FormData()
            formData.append("file", selectedFile)
            // Pass other data if available for context

            try {
                const result = await analyzeDocumentAction(formData)
                if (result.success) {
                    setAnalysisResult(result.analysis as any)
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
        setTimeout(() => {
            setLoading(false)
            router.push("/dashboard/procurements")
        }, 1500)
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/procurements"
                    className="rounded-full border border-zinc-200 bg-white p-2 hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">New Procurement</h1>
                    <p className="text-zinc-500">Initiate a new procurement process and trigger AI risk assessment.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm space-y-8">
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Basic Information</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Procurement Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Supply of IT Infrastructure"
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Procurement Method</label>
                                <select className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all bg-white">
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
                            <div className="space-y-2 text-wrap">
                                <label className="text-sm font-bold text-zinc-700">Estimated Value</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full rounded-lg border border-zinc-200 pl-8 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Currency</label>
                                <select className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-950 transition-all bg-white">
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
                            <label className="text-sm font-bold text-zinc-700">Upload Bid/Tender Document (PDF)</label>
                            {!file ? (
                                <div
                                    className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-900">Click to upload or drag and drop</p>
                                    <p className="text-xs text-zinc-500 mt-1">PDF version of the procurement guidelines or vendor bid</p>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                            <File className="h-5 w-5 text-zinc-900" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{file.name}</p>
                                            <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="p-2 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {analyzing && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 animate-pulse">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm font-semibold">Gemini AI is analyzing document for compliance...</span>
                                </div>
                            )}

                            {analysisResult && (
                                <div className={`p-6 rounded-xl border ${analysisResult.isCompliant ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {analysisResult.isCompliant ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-rose-600" />
                                            )}
                                            <h4 className={`text-sm font-bold ${analysisResult.isCompliant ? "text-emerald-900" : "text-rose-900"
                                                }`}>
                                                AI Compliance Preview: {analysisResult.isCompliant ? "Fully Compliant" : "Compliance Issues Found"}
                                            </h4>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {analysisResult.findings.map((finding, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600">
                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-400 shrink-0" />
                                                {finding}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="pt-6 border-t border-zinc-100 flex items-center justify-end gap-3">
                        <Link
                            href="/dashboard/procurements"
                            className="px-6 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-8 py-2 text-sm font-semibold text-white shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save & Initiate AI Risk Scoring
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center bg-zinc-50/50">
                    <p className="text-sm text-zinc-400 font-medium italic">
                        Note: Upon saving, the system will automatically trigger a Gemini AI Risk Assessment flow to analyze the tender method against the estimated value and historical vendor performance.
                    </p>
                </div>
            </form>
        </div>
    )
}
