import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Upload, ArrowLeft, Film, Tag, Globe, Users, Lock,
  Sparkles, Check, Camera, Mic, MonitorPlay, PenLine,
  X, Image
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = [
  "data-structures", "web-development", "machine-learning", "operating-systems",
  "mathematics", "physics", "chemistry", "biology", "upsc-preparation",
  "competitive-programming", "system-design", "productivity", "career-guidance",
  "interview-prep", "ai-tools", "coding-tutorial", "motivation",
];

const CONTENT_TYPES = [
  { id: "concept", label: "Concept Explanation", icon: PenLine },
  { id: "coding", label: "Coding Tutorial", icon: MonitorPlay },
  { id: "formula", label: "Formula Trick", icon: Sparkles },
  { id: "motivation", label: "Motivation", icon: Camera },
  { id: "quiz", label: "Quick Quiz", icon: Check },
  { id: "voiceover", label: "Voice-over Lesson", icon: Mic },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe, desc: "Anyone can view" },
  { value: "followers", label: "Followers Only", icon: Users, desc: "Only your followers" },
  { value: "private", label: "Private", icon: Lock, desc: "Only you" },
];

const AI_FEATURES = [
  "Auto-caption generation",
  "Subtitle creation",
  "Topic tagging",
  "Category detection",
  "Thumbnail suggestion",
  "Educational quality analysis",
];

export default function ReelsUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [contentType, setContentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 500MB per reel", variant: "destructive" });
      return;
    }
    setFile(f);
    setStep(2);
  }

  function handleThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setThumbnail(url);
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function handleUpload() {
    if (!file || !title || !subject) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }
    setUploading(true);
    // Simulate upload
    await new Promise((r) => setTimeout(r, 2500));
    setUploading(false);
    toast({ title: "Reel uploaded successfully!", description: "AI is processing your captions and tags." });
    setLocation("/reels");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <Link href="/reels">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Reels
        </button>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload</span>
        </div>
        <h1 className="text-3xl font-bold font-serif">Share a Learning Reel</h1>
        <p className="text-muted-foreground text-sm mt-1">Max 4 minutes · 9:16 vertical · Educational content only</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["Select Video", "Details", "Settings", "Review"].map((s, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < 3 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Select Video */}
      {!file && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
          <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <h3 className="text-lg font-semibold mb-2">Drop your reel here</h3>
          <p className="text-muted-foreground text-sm mb-4">MP4, MOV, WebM · Max 4 min · Max 500MB</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            {["Screen recordings", "Whiteboard", "Coding demos", "Animated tutorials", "Lectures"].map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Steps 2-4 */}
      {file && (
        <div className="space-y-6">
          {/* File info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button onClick={() => { setFile(null); setStep(1); }} className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title *</label>
                <Input
                  placeholder="e.g. Binary Search in 3 Minutes"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (e.target.value && step === 2) setStep(3); }}
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground mt-1">{title.length}/80</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="What will students learn from this reel?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/300</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject / Category *</label>
                <select
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); if (e.target.value) setStep(3); }}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a subject…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s.replace(/-/g, " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Content Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setContentType(t.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                        contentType === t.id ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Thumbnail */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Thumbnail</label>
                <div
                  onClick={() => thumbRef.current?.click()}
                  className="h-32 rounded-xl border-2 border-dashed cursor-pointer hover:border-primary transition-colors flex items-center justify-center overflow-hidden"
                >
                  <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
                  {thumbnail ? (
                    <img src={thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Image className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">Click to upload thumbnail</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Hashtags <span className="text-muted-foreground font-normal text-xs">({tags.length}/8)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="#algorithms"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={addTag} disabled={tags.length >= 8}>
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs gap-1">
                        #{t}
                        <button onClick={() => removeTag(t)}><X className="w-2.5 h-2.5" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Privacy</label>
                <div className="space-y-2">
                  {PRIVACY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPrivacy(p.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${
                        privacy === p.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p.icon className={`w-4 h-4 flex-shrink-0 ${privacy === p.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.desc}</div>
                      </div>
                      {privacy === p.value && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Features panel */}
          <div className="bg-gradient-to-r from-purple-500/5 to-primary/5 border border-purple-200/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-sm">AI will automatically generate</span>
              <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px]">Powered by AI</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Upload button */}
          <Button
            className="w-full h-12 text-base rounded-xl"
            onClick={() => { setStep(4); handleUpload(); }}
            disabled={uploading || !file || !title || !subject}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading & Processing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Publish Reel
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
