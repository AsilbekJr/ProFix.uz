import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery, useApplyAsSpecialistMutation } from '../store/apiSlice';
import toast from 'react-hot-toast';
import { 
  MapPin, X, UploadCloud, ChevronLeft, ChevronRight, 
  Phone, FileText, Send, Sparkles, Briefcase, 
  Loader2, Info, ArrowRight, ArrowLeft
} from 'lucide-react';
import { REGIONS, getDistricts, formatLocation } from '../lib/uzbekistan';
import { formatPhone } from '../lib/utils';

export default function ApplySpecialistPage() {
  const navigate = useNavigate();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const [applyAsSpecialist, { isLoading: submitting }] = useApplyAsSpecialistMutation();

  const categories = categoriesRes?.data || [];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    categoryId: '',
    customCategory: '',
    bio: '',
    region: '',
    district: '',
    phone: '',
    documents: [] as File[],
  });

  const districts = getDistricts(form.region);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setForm(f => {
        const merged = [...f.documents, ...newFiles].slice(0, 5); 
        return { ...f, documents: merged };
      });
      e.target.value = '';
    }
  };

  const removeDoc = (index: number) => {
    setForm(f => ({ ...f, documents: f.documents.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!form.categoryId) { toast.error("Iltimos, sohangizni tanlang"); return; }
    if (!form.region) { toast.error("Iltimos, viloyatingizni tanlang"); return; }
    if (!form.district) { toast.error("Iltimos, tumaningizni tanlang"); return; }

    try {
      const fd = new FormData();
      if (form.categoryId === 'other') {
        if (!form.customCategory.trim()) { toast.error("Yangi soha nomini yozing"); return; }
        fd.append('customCategoryName', form.customCategory);
      } else {
        fd.append('categoryId', form.categoryId);
      }
      fd.append('bio', form.bio);
      fd.append('location', formatLocation(form.region, form.district));
      if (form.phone.trim()) fd.append('contactPhone', form.phone.trim());
      form.documents.forEach(doc => fd.append('documents', doc));

      await applyAsSpecialist(fd).unwrap();
      toast.success("Ariza qabul qilindi! ✅ Admin tekshiruvidan so'ng natija chiqadi.");
      navigate('/profile');
    } catch (err: any) {
      const msg = err.data?.message || 'xatolik yuz berdi';
      if (msg.includes('allaqachon')) {
        toast.error("Siz allaqachon mutaxassis sifatida ro'yxatdansiz"); navigate('/profile');
      } else if (msg.includes('topilmadi') || err.status === 401) {
        toast.error("Sessiya muddati o'tgan. Iltimos, qayta kiring."); navigate('/auth');
      } else {
        toast.error(msg);
      }
    }
  };

  const STEPS = [
    { title: "Soha & Bio" },
    { title: "Manzil & Aloqa" },
    { title: "Hujjatlar" }
  ];

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ flexShrink: 0 }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Mutaxassis bo'lish
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, marginTop: 2 }}>
              Jamoamizga qo'shiling va daromadingizni oshiring
            </p>
          </div>
        </div>

        {/* PROGRESS STEPPER */}
        <div style={{ display: 'flex', gap: 8 }}>
          {STEPS.map((s, i) => {
            const isActive = step === i + 1;
            const isDone = step > i + 1;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  height: 6, borderRadius: 10, transition: 'all 0.4s ease',
                  background: isDone || isActive ? 'var(--primary)' : 'var(--border)'
                }} />
                <p style={{
                  fontSize: 12, fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-sub)',
                  textAlign: 'center', transition: 'color 0.3s'
                }}>
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 400 }}>
        
        {/* ── STEP 1: CATEGORY & BIO ── */}
        {step === 1 && (
          <div className="fade-in slide-in-from-right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="section-label">Xizmat ko'rsatish yo'nalishi</label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <Briefcase size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <select
                  value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  style={{ paddingLeft: 46 }}
                >
                  <option value="">Yo'nalishni tanlang...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="other">Boshqa (yangi yo'nalish)</option>
                </select>
              </div>
              
              {form.categoryId === 'other' && (
                <div className="slide-down" style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    placeholder="Qanday yo'nalish qo'shmoqchisiz?"
                    value={form.customCategory}
                    onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                    style={{ borderStyle: 'dashed', borderColor: 'var(--primary)', background: 'var(--primary-glow)' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="section-label">Tashrifnoma (Bio)</label>
              <textarea
                rows={5}
                placeholder="Tajribangiz, ish uslubingiz va mijozlarga nima taklif qilishingiz mumkinligi haqida..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            </div>

            <button 
              className="btn btn-primary" 
              style={{ height: 56, borderRadius: 16, marginTop: 12 }}
              disabled={!form.categoryId || (form.categoryId === 'other' && !form.customCategory)} 
              onClick={() => { window.scrollTo(0,0); setStep(2); }}
            >
              <span>Keyingi qadam</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 2: ADDRESS & PHONE ── */}
        {step === 2 && (
          <div className="fade-in slide-in-from-right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="section-label">Viloyat</label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <select
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value, district: '' }))}
                  style={{ paddingLeft: 46 }}
                >
                  <option value="">Viloyatni tanlang</option>
                  {REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                </select>
              </div>
            </div>

            {form.region && (
              <div className="slide-down">
                <label className="section-label">Shahar / Tuman</label>
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                  <select
                    value={form.district}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                    style={{ paddingLeft: 46 }}
                  >
                    <option value="">Tuman/Shaharni tanlang</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="section-label">Bog'lanish uchun telefon (Ixtiyoriy)</label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Agar ustalik xizmati uchun boshqa raqam ishlatsangiz..."
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                  style={{ paddingLeft: 46 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button className="btn-icon" onClick={() => setStep(1)} style={{ width: 64, height: 56, borderRadius: 16 }}>
                <ArrowLeft size={24} />
              </button>
              <button 
                className="btn btn-primary" 
                style={{ height: 56, borderRadius: 16, flex: 1 }}
                disabled={!form.region || !form.district} 
                onClick={() => { window.scrollTo(0,0); setStep(3); }}
              >
                <span>Keyingi qadam</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: DOCUMENTS ── */}
        {step === 3 && (
          <div className="fade-in slide-in-from-right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{
              padding: 16, borderRadius: 20, display: 'flex', gap: 16,
              background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)'
            }} className="scale-in">
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(52,211,153,0.1)', color: 'var(--accent)'
              }}>
                <Sparkles size={24} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: 'Poppins, sans-serif' }}>
                  Hujjatlar yordam beradi
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Pasport, sertifikat, havolalar yoki ish joyidan ma'lumotnoma yuklash sizning platformadagi "Verified" statusingizni tezlashtiradi.
                </p>
              </div>
            </div>

            <div>
              <label className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hujjatlar (ixtiyoriy)</span>
                <span>{form.documents.length} / 5</span>
              </label>

              <label style={{
                height: 120, borderRadius: 20, border: '2px dashed var(--border)', marginTop: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-sub)', cursor: 'pointer', background: 'var(--bg-input)', transition: 'all 0.3s'
              }} className="hover:border-[var(--primary)] hover:bg-[var(--primary-glow)] hover:text-[var(--primary)]">
                <UploadCloud size={32} style={{ marginBottom: 8 }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Hujjat biriktirish</span>
                <span style={{ fontSize: 12, marginTop: 4 }}>PDF, DOC, rasmlar</span>
                <input type="file" multiple hidden onChange={handleDocChange} accept=".pdf,.doc,.docx,image/*" />
              </label>
            </div>

            {form.documents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, background: 'var(--bg-input)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elev)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeDoc(i)}
                      style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              padding: 16, borderRadius: 20, display: 'flex', gap: 12, marginTop: 16,
              background: 'rgba(251,191,36,0.1)', border: '1px dashed rgba(251,191,36,0.5)'
            }}>
              <Info size={20} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                Arizangiz admin tomondan ko'rib chiqiladi. Ruxsat berilgach, usta sifatida pullik buyurtmalar ololasiz.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn-icon" onClick={() => setStep(2)} style={{ width: 64, height: 56, borderRadius: 16 }}>
                <ArrowLeft size={24} />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting} 
                className="btn btn-gradient"
                style={{ height: 56, borderRadius: 16, flex: 1, fontSize: 16 }}
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                <span>{submitting ? 'Yuborilmoqda...' : 'Arizani yuborish'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
