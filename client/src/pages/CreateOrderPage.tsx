import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateOrderMutation, useGetCategoriesQuery } from '../store/apiSlice';
import toast from 'react-hot-toast';
import { 
  Camera, CheckCircle, ChevronLeft, MapPin, 
  PenLine, Send, Wrench, Lightbulb, PhoneCall, X, 
  ChevronRight, AlertCircle, Info, ArrowRight, ArrowLeft, Loader2
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

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const user = useSelector((state: RootState) => state.auth.user);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    categoryId: state?.categoryId || '',
    categoryName: state?.categoryName || '',
    specialistId: state?.specialistId || '',
    description: '',
    region: '',
    district: '',
    street: '',
    secondaryPhone: '',
    photos: [] as File[]
  });

  const [createOrder, { isLoading: submitting }] = useCreateOrderMutation();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const districts = getDistricts(form.region);

  const fullAddress = [
    form.region,
    form.district,
    form.street
  ].filter(Boolean).join(', ');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setForm(f => {
        const merged = [...f.photos, ...newFiles].slice(0, 5);
        return { ...f, photos: merged };
      });
      setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append('categoryId', form.categoryId);
      if (form.specialistId) fd.append('specialistId', form.specialistId);
      fd.append('description', form.description);
      fd.append('address', fullAddress);
      if (form.secondaryPhone) fd.append('secondaryPhone', form.secondaryPhone);
      form.photos.forEach(f => fd.append('photos', f));

      await createOrder(fd).unwrap();
      toast.success("Buyurtma yuborildi! Usta tez orada bog'lanadi 🎉");
      navigate('/orders');
    } catch (err: any) {
      const errMsg = err.data?.message || 'Xatolik yuz berdi';
      toast.error(errMsg);
    }
  };

  const STEPS = [
    { title: 'Tavsif', icon: <PenLine size={16} /> },
    { title: 'Manzil', icon: <MapPin size={16} /> },
    { title: 'Tasdiqlash', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              {form.specialistId ? 'Ustaga buyurtma' : 'Yangi buyurtma'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
              {form.categoryName || 'Xizmat tanlang'}
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

      <main style={{ padding: '0 20px', minHeight: 400 }}>
        
        {/* TENDER HINT (Step 1) */}
        {step === 1 && (
          <div style={{
            padding: 16, borderRadius: 20, marginBottom: 24, display: 'flex', gap: 16,
            background: form.specialistId ? 'rgba(16,185,129,0.05)' : 'var(--primary-glow)',
            border: `1px solid ${form.specialistId ? 'rgba(16,185,129,0.2)' : 'var(--border-hover)'}`
          }} className="scale-in">
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: form.specialistId ? 'rgba(16,185,129,0.1)' : 'var(--bg-elev)',
              color: form.specialistId ? 'var(--accent)' : 'var(--primary)'
            }}>
              <Lightbulb size={24} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontFamily: 'Poppins, sans-serif' }}>
                {form.specialistId ? 'Xususiy buyurtma' : "Umumiy tender"}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                {form.specialistId 
                  ? "Siz tanlagan ustaga to'g'ridan-to'g'ri xabar boradi." 
                  : "Buyurtmangiz hududdagi barcha ustalarga e'lon qilinadi."}
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 1: DESCRIPTION ================= */}
        {step === 1 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
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

            <div>
              <label className="section-label">Muammo tavsifi</label>
              <textarea
                rows={5}
                placeholder="Muammoni batafsil yozib qoldiring..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            </div>

            <div>
              <label className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rasmlar (Ixtiyoriy)</span>
                <span>{form.photos.length} / 5</span>
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {photoPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                    <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, border: '2px solid var(--primary)' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: '50%',
                        background: 'var(--danger)', color: '#fff', border: '2px solid var(--bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                
                {form.photos.length < 5 && (
                  <label style={{
                    width: 72, height: 72, borderRadius: 16, border: '2px dashed var(--border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-sub)', cursor: 'pointer', background: 'var(--bg-input)'
                  }}>
                    <Camera size={24} />
                    <input type="file" accept="image/*" multiple hidden onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ height: 56, borderRadius: 16, marginTop: 12 }}
              disabled={!form.description || !form.categoryId} 
              onClick={() => { window.scrollTo(0,0); setStep(2); }}
            >
              <span>Keyingi qadam</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ================= STEP 2: ADDRESS ================= */}
        {step === 2 && (
          <div className="fade-in slide-InRight" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              <label className="section-label">Manzil (Ixtiyoriy)</label>
              <div style={{ position: 'relative', marginTop: 8 }}>
                <Info size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Ko'cha, uy raqami, mo'ljal..."
                  value={form.street}
                  onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                  style={{ paddingLeft: 46 }}
                />
              </div>
            </div>

            <div>
              <label className="section-label">Qo'shimcha telefon raqam (Ixtiyoriy)</label>
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
                <span>Tekshirish</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUMMARY ================= */}
        {step === 3 && (
          <div className="fade-in slide-in-from-right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div className="card" style={{ padding: 24 }}>
              <InfoRow icon={<Wrench size={20} />} label="Xizmat" value={form.categoryName} />
              <div className="divider" style={{ margin: '16px 0' }} />
              <InfoRow icon={<PenLine size={20} />} label="Tavsif" value={form.description} />
              <div className="divider" style={{ margin: '16px 0' }} />
              <InfoRow icon={<MapPin size={20} />} label="Manzil" value={fullAddress} />
              
              {form.secondaryPhone && (
                <>
                  <div className="divider" style={{ margin: '16px 0' }} />
                  <InfoRow icon={<PhoneCall size={20} />} label="Qo'shimcha aloqa" value={form.secondaryPhone} />
                </>
              )}
              
              {form.photos.length > 0 && (
                 <>
                   <div className="divider" style={{ margin: '16px 0' }} />
                   <InfoRow icon={<Camera size={20} />} label="Ilovalar" value={`${form.photos.length} ta foto biriktirilgan`} />
                 </>
              )}
            </div>

            <div style={{
              padding: 16, borderRadius: 20, display: 'flex', gap: 12,
              background: 'rgba(251,191,36,0.1)', border: '1px dashed rgba(251,191,36,0.5)'
            }}>
              <AlertCircle size={20} style={{ color: '#FBBF24', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                Buyurtma yuborilgach tahrirlab bo'lmaydi. Barcha ma'lumotlar to'g'riligini tasdiqlaysizmi?
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
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
                <span>{submitting ? 'Yuborilmoqda...' : 'Yuborish'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 16, background: 'var(--bg-elev)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary)', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{value}</p>
      </div>
    </div>
  );
}
