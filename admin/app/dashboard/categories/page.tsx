'use client';
import { useState } from 'react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from '@/store/adminApiSlice';
import toast from 'react-hot-toast';
import { 
  FolderTree, Plus, X, Trash2, Loader2, Wrench,
  Zap, Frame, DoorClosed, Home, Snowflake, Key,
  Droplet, Hammer, Truck, Monitor, Cpu, Sofa,
  TreePine, Car, Brush, Flame, Camera, Wifi, Shirt, Wind, Shield
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Wrench, Zap, Frame, DoorClosed, Home, Snowflake, Key,
  Droplet, Hammer, Truck, Monitor, Cpu, Sofa,
  TreePine, Car, Brush, Flame, Camera, Wifi, Shirt, Wind, Shield
};

export default function CategoriesPage() {
  const { data: res, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const categories = res?.data || [];

  const [form, setForm] = useState({ name: '', icon: '' });
  const [adding, setAdding] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(form).unwrap();
      toast.success('Kategoriya qo\'shildi!');
      setForm({ name: '', icon: '' });
      setAdding(false);
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategoriyasini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Kategoriya o\'chirildi');
    } catch {
      toast.error('O\'chirib bo\'lmadi (bog\'liq xizmatlar mavjud bo\'lishi mumkin)');
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderTree size={32} color="var(--primary)" /> Xizmat Kategoriyalari
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tizimdagi asosiy xizmat sohalarini boshqarish</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }} onClick={() => setAdding(!adding)}>
          {adding ? <><X size={18} /> Bekor</> : <><Plus size={18} /> Yangi kategoriya</>}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleCreate} style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--primary)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr auto',
          gap: '20px',
          alignItems: 'end',
          boxShadow: '0 10px 40px rgba(108,99,255,0.15)',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Ikon (Lucide nomi)
            </label>
            <input
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="Masalan: Wrench"
              style={{ width: '100%', padding: '12px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Kategoriya nomi
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Masalan: Santexnika xizmatlari"
              required
              style={{ width: '100%', padding: '12px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>Saqlash</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1/-1', padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px' }} />
             <p>Kategoriyalar yuklanmoqda...</p>
          </div>
        ) : (
          categories.map((cat: import('@/types').Category) => {
            const IconComp = ICON_MAP[cat.icon || ''] || Wrench;
            return (
              <div key={cat.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ 
                     width: 54, height: 54, borderRadius: '16px', 
                     background: 'rgba(108,99,255,0.08)', color: 'var(--primary)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center'
                   }}>
                     <IconComp size={28} />
                   </div>
                   <button 
                     onClick={() => handleDelete(cat.id, cat.name)}
                     style={{ 
                       background: 'none', border: 'none', color: 'var(--danger)', 
                       cursor: 'pointer', padding: '8px', opacity: 0.6,
                       transition: 'opacity 0.2s'
                     }}
                     onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                     onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{cat.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {cat.subCategories?.length || 0} ta subkategoriya • 0 ta usta
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {categories.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <p>Kategoriyalar mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  );
}
