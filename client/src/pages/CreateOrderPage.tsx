import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateOrderMutation, useGetCategoriesQuery } from '../store/apiSlice';
import toast from 'react-hot-toast';
import {
  Camera, CheckCircle, ChevronLeft, MapPin,
  PenLine, Send, Wrench, PhoneCall, X,
  AlertCircle, ArrowRight, ArrowLeft, Loader2,
  Navigation, Keyboard
} from 'lucide-react';
import { REGIONS, getDistricts } from '../lib/uzbekistan';
import { formatPhone } from '../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface LocationState {
  categoryId?: string;
  categoryName?: string;
  specialistId?: string;
}

// ── Viral Step Indicator ──
const STEPS = [
  { title: 'Muammo',  emoji: '📸' },
  { title: 'Manzil',  emoji: '📍' },
  { title: 'Yuborish', emoji: '✅' },
];

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const user = useSelector((state: RootState) => state.auth.user);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual' | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({
    categoryId: state?.categoryId || '',
    categoryName: state?.categoryName || '',
    specialistId: state?.specialistId || '',
    description: '',
    region: '',
    district: '',
    street: '',
    secondaryPhone: '',
    photos: [] as File[],
    gpsLat: null as number | null,
    gpsLng: null as number | null,
    gpsAddress: '',
  });

  const [createOrder, { isLoading: submitting }] = useCreateOrderMutation();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const districts = getDistricts(form.region);

  const fullAddress = form.gpsAddress
    ? form.gpsAddress
    : [form.region, form.district, form.street].filter(Boolean).join(', ');

  // ── Photo handlers ──
  const addPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setForm(f => ({ ...f, photos: [...f.photos, ...newFiles].slice(0, 5) }));
    setPhotoPreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── GPS ──
  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS qo'llab-quvvatlanmaydi");
      setLocationMode('manual');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
            { headers: { 'User-Agent': 'ProFix-Bot/1.0' } }
          );
          const data = await resp.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Noma\'lum joy';
          const street = data.address?.road || data.address?.suburb || '';
          const address = `${city}${street ? ', ' + street : ''}`;
          setForm(f => ({ ...f, gpsLat: lat, gpsLng: lng, gpsAddress: address }));
          toast.success('📍 Manzil aniqlandi!');
        } catch {
          setForm(f => ({ ...f, gpsLat: lat, gpsLng: lng, gpsAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
          toast.success('📍 GPS koordinatalar saqlandi');
        }
        setGpsLoading(false);
        setLocationMode('gps');
      },
      () => {
        setGpsLoading(false);
        toast.error('GPS ishlamadi. Manzilni yozing.');
        setLocationMode('manual');
      },
      { timeout: 10000 }
    );
  };

  // ── Submit ──
  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append('categoryId', form.categoryId);
      if (form.specialistId) fd.append('specialistId', form.specialistId);
      fd.append('description', form.description);
      fd.append('address', fullAddress);
      if (form.gpsLat != null) fd.append('locationLat', String(form.gpsLat));
      if (form.gpsLng != null) fd.append('locationLng', String(form.gpsLng));
      if (form.secondaryPhone) fd.append('secondaryPhone', form.secondaryPhone);
      form.photos.forEach(f => fd.append('photos', f));

      await createOrder(fd).unwrap();
      setSubmitted(true);
      setTimeout(() => navigate('/orders'), 2800);
    } catch (err: any) {
      const errMsg = err.data?.message || 'Xatolik yuz berdi';
      toast.error(errMsg);
    }
  };

  // ── Go to next step ──
  const nextStep = () => { window.scrollTo(0, 0); setStep(s => s + 1); };
  const prevStep = () => { window.scrollTo(0, 0); setStep(s => s - 1); };

  // ── SUCCESS screen ──
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: 24, gap: 20, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Confetti pieces */}
        {['#7C6EFA','#F472B6','#34D399','#FBBF24','#60A5FA'].map((color, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              background: color,
              left: `${15 + i * 18}%`,
              top: '-10px',
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${1 + i * 0.2}s`,
            }}
          />
        ))}

        {/* Success icon */}
        <div style={{
          fontSize: 80, lineHeight: 1,
          animation: 'successBounce 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        }}>
          ✅
        </div>

        <div>
          <h2 style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 900,
            color: 'var(--text)', marginBottom: 8,
          }}>
            Buyurtma yuborildi!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Usta qidirilmoqda...<br />
            Tez orada siz bilan bog'lanadi 🔧
          </p>
        </div>

        {/* Spinning cog animation */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <div style={{
            fontSize: 50, position: 'absolute', top: 0, left: 0,
            animation: 'cogSpin 2s linear infinite',
          }}>
            ⚙️
          </div>
          <div style={{
            fontSize: 30, position: 'absolute', bottom: 0, right: 0,
            animation: 'cogSpin 1.5s linear infinite reverse',
          }}>
            🔧
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
          Buyurtmalar sahifasiga yo'naltirilmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 16px',
        background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <button className="btn-icon" onClick={() => step > 1 ? prevStep() : navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
              {form.specialistId ? 'Ustaga buyurtma' : 'Usta chaqirish'}
            </h1>
            {form.categoryName && (
              <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                {form.categoryName}
              </p>
            )}
          </div>
        </div>

        {/* ── VIRAL STEP INDICATOR ── */}
        <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
          {STEPS.map((s, i) => {
            const isActive = step === i + 1;
            const isDone = step > i + 1;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 17, left: '50%', right: '-50%',
                    height: 2, background: isDone ? 'var(--primary)' : 'var(--border)',
                    transition: 'background 0.4s ease', zIndex: 0,
                  }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  background: isDone ? 'var(--accent)' : isActive ? 'var(--primary)' : 'var(--bg-elev)',
                  boxShadow: isActive ? '0 0 0 4px var(--primary-glow)' : isDone ? '0 0 0 4px rgba(52,211,153,0.2)' : 'none',
                  transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                }}>
                  {isDone ? <CheckCircle size={18} color="#fff" /> : s.emoji}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  color: isActive ? 'var(--primary)' : isDone ? 'var(--accent)' : 'var(--text-sub)',
                  transition: 'color 0.3s',
                }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      <main style={{ padding: '20px 20px 0', minHeight: 400 }}>

        {/* ======= STEP 1: MUAMMO ======= */}
        {step === 1 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Info banner */}
            <div style={{
              padding: '14px 16px', borderRadius: 16, display: 'flex', gap: 12,
              background: form.specialistId ? 'rgba(52,211,153,0.07)' : 'var(--primary-glow)',
              border: `1px solid ${form.specialistId ? 'rgba(52,211,153,0.2)' : 'var(--border-hover)'}`,
            }}>
              <span style={{ fontSize: 22 }}>{form.specialistId ? '👨‍🔧' : '💡'}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                  {form.specialistId ? 'Xususiy buyurtma' : 'Umumiy tender'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  {form.specialistId
                    ? "Siz tanlagan ustaga to'g'ridan-to'g'ri xabar boradi."
                    : "Buyurtmangiz hududdagi barcha ustalarga e'lon qilinadi."}
                </p>
              </div>
            </div>

            {/* Category selector (if not pre-selected) */}
            {!state?.categoryId && (
              <div>
                <label className="section-label">Xizmat turi</label>
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <Wrench size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                  <select
                    value={form.categoryId}
                    onChange={e => {
                      const cat = categories.find((c: any) => c.id === e.target.value);
                      setForm(f => ({ ...f, categoryId: e.target.value, categoryName: cat?.name || '' }));
                    }}
                    style={{ paddingLeft: 46 }}
                  >
                    <option value="">Yo'nalishni tanlang...</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="section-label">Muammo tavsifi</label>
              <textarea
                rows={4}
                placeholder="Muammoni qisqacha yozib qoldiring... (masalan: kran sizmoqda, chiroq yonmayapti)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            </div>

            {/* Photo upload — drag and drop zone */}
            <div>
              <label className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📷 Rasmlar (Ixtiyoriy)</span>
                <span style={{ color: 'var(--primary)' }}>{form.photos.length} / 5</span>
              </label>

              {/* Drag zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addPhotos(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: 8, borderRadius: 16, border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                  padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'var(--primary-glow)' : 'var(--bg-input)',
                  transition: 'all 0.2s',
                  display: form.photos.length >= 5 ? 'none' : 'block',
                }}
              >
                <span style={{ fontSize: 28 }}>📷</span>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 6 }}>
                  Rasmni bu yerga tashlang yoki bosing
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 3 }}>
                  Muammoni ko'rsating — usta tezroq keladi
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file" accept="image/*" multiple hidden
                onChange={e => addPhotos(e.target.files)}
              />

              {/* Previews */}
              {photoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  {photoPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img src={src} alt="preview" style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        borderRadius: 14, border: '2px solid var(--primary)',
                      }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 22, height: 22,
                          borderRadius: '50%', background: 'var(--danger)', color: '#fff',
                          border: '2px solid var(--bg)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer',
                        }}
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-gradient"
              style={{ height: 54, borderRadius: 16, fontSize: 15, marginTop: 8, fontWeight: 800 }}
              disabled={!form.description || !form.categoryId}
              onClick={nextStep}
            >
              <span>Keyingi qadam</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ======= STEP 2: MANZIL ======= */}
        {step === 2 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* GPS — PRIMARY option */}
            <div>
              <p style={{
                fontSize: 13, fontWeight: 700, color: 'var(--text-sub)',
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10,
              }}>
                📍 Manzilni qanday yuborasiz?
              </p>

              {/* GPS button — big, prominent */}
              {locationMode !== 'gps' && (
                <button
                  id="gps-location-btn"
                  className="btn"
                  disabled={gpsLoading}
                  onClick={handleGPS}
                  style={{
                    height: 64, borderRadius: 18, width: '100%', fontSize: 16, fontWeight: 800,
                    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                    color: '#fff', gap: 12,
                    boxShadow: '0 8px 28px rgba(52,211,153,0.35)',
                    marginBottom: 10,
                  }}
                >
                  {gpsLoading
                    ? <><Loader2 size={22} className="animate-spin" />Manzil aniqlanmoqda...</>
                    : <><Navigation size={22} />GPS orqali manzilni yuborish</>
                  }
                </button>
              )}

              {/* GPS success state */}
              {locationMode === 'gps' && form.gpsAddress && (
                <div style={{
                  padding: '14px 16px', borderRadius: 16, marginBottom: 12,
                  background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 22 }}>📍</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>Manzil aniqlandi!</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{form.gpsAddress}</p>
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}
                    onClick={() => { setLocationMode(null); setForm(f => ({ ...f, gpsAddress: '', gpsLat: null, gpsLng: null })); }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Manual option toggle */}
              {locationMode !== 'gps' && (
                <button
                  className="btn btn-ghost"
                  style={{ height: 46, borderRadius: 14, fontSize: 13 }}
                  onClick={() => setLocationMode('manual')}
                >
                  <Keyboard size={16} />
                  Manzilni qo'lda yozish
                </button>
              )}
            </div>

            {/* Manual address fields */}
            {locationMode === 'manual' && (
              <div className="scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="section-label">Viloyat</label>
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                    <select
                      value={form.region}
                      onChange={e => setForm(f => ({ ...f, region: e.target.value, district: '' }))}
                      style={{ paddingLeft: 46 }}
                    >
                      <option value="">Tanlang...</option>
                      {REGIONS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>

                {form.region && (
                  <div className="scale-in">
                    <label className="section-label">Tuman / Shahar</label>
                    <div style={{ position: 'relative', marginTop: 8 }}>
                      <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                      <select
                        value={form.district}
                        onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                        style={{ paddingLeft: 46 }}
                      >
                        <option value="">Tanlang...</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="section-label">Ko'cha / Mo'ljal (Ixtiyoriy)</label>
                  <input
                    type="text"
                    placeholder="Ko'cha, uy raqami..."
                    value={form.street}
                    onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="section-label">Qo'shimcha telefon (Ixtiyoriy)</label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <PhoneCall size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  placeholder="+998 XX XXX XX XX"
                  value={form.secondaryPhone}
                  onChange={e => setForm(f => ({ ...f, secondaryPhone: formatPhone(e.target.value) }))}
                  style={{ paddingLeft: 46 }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button className="btn-icon" onClick={prevStep} style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0 }}>
                <ArrowLeft size={22} />
              </button>
              <button
                className="btn btn-gradient"
                style={{ height: 54, borderRadius: 16, flex: 1, fontSize: 15, fontWeight: 800 }}
                disabled={locationMode === 'manual' ? !form.region || !form.district : !locationMode}
                onClick={nextStep}
              >
                <span>Tekshirish</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ======= STEP 3: TASDIQLASH ======= */}
        {step === 3 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="card" style={{ padding: 20 }}>
              <SummaryRow emoji="🔧" label="Xizmat" value={form.categoryName} />
              <div className="divider" style={{ margin: '14px 0' }} />
              <SummaryRow emoji="📝" label="Tavsif" value={form.description} />
              <div className="divider" style={{ margin: '14px 0' }} />
              <SummaryRow emoji="📍" label="Manzil" value={fullAddress || '—'} />
              {form.photos.length > 0 && (
                <>
                  <div className="divider" style={{ margin: '14px 0' }} />
                  <SummaryRow emoji="📷" label="Rasmlar" value={`${form.photos.length} ta foto biriktirilgan`} />
                </>
              )}
              {form.secondaryPhone && (
                <>
                  <div className="divider" style={{ margin: '14px 0' }} />
                  <SummaryRow emoji="📞" label="Qo'shimcha tel" value={form.secondaryPhone} />
                </>
              )}
            </div>

            {/* Warning */}
            <div style={{
              padding: '14px 16px', borderRadius: 16, display: 'flex', gap: 12,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
            }}>
              <AlertCircle size={20} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                Buyurtma yuborilgach tahrirlab bo'lmaydi. Ma'lumotlar to'g'riligini tasdiqlang.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-icon" onClick={prevStep} style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0 }}>
                <ArrowLeft size={22} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-gradient"
                style={{ height: 54, borderRadius: 16, flex: 1, fontSize: 16, fontWeight: 900 }}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span>{submitting ? 'Yuborilmoqda...' : '🚀 Usta chaqirish!'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elev)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 18,
      }}>
        {emoji}
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 3, lineHeight: 1.5 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
