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

const S = {
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', outline: 'none' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '1px', display: 'block', marginBottom: '8px' },
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
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <FolderTree size={30} color="var(--primary)" /> Xizmat Kategoriyalari
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tizimdagi asosiy xizmat sohalarini boshqarish</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="shrink-0 whitespace-nowrap"
          style={{
            padding: '10px 20px', borderRadius: 14, fontSize: 14, fontWeight: 800,
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: adding ? 'var(--bg-card2)' : 'var(--primary)',
            color: adding ? 'var(--text)' : '#fff',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: adding ? 'none' : '0 6px 20px rgba(108,99,255,0.25)',
          }}
        >
          {adding ? <><X size={16} /> Bekor qilish</> : <><Plus size={16} /> Yangi kategoriya</>}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form
          onSubmit={handleCreate}
          className="bg-[var(--bg-card)] border-2 border-[var(--primary)] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-5 items-end"
          style={{ boxShadow: '0 10px 40px rgba(108,99,255,0.12)' }}
        >
          <div className="md:col-span-4 lg:col-span-3">
            <label style={S.label}>Ikon (Lucide nomi)</label>
            <input
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="Masalan: Wrench"
              style={S.input}
              className="min-w-0 w-full"
            />
          </div>
          <div className="md:col-span-5 lg:col-span-6">
            <label style={S.label}>Kategoriya nomi</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Masalan: Santexnika xizmatlari"
              required
              style={S.input}
              className="min-w-0 w-full"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-3 lg:col-span-3"
            style={{
              padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 800,
              background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(108,99,255,0.25)', whiteSpace: 'nowrap' as const,
            }}
          >
            Saqlash
          </button>
        </form>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1/-1', padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Kategoriyalar yuklanmoqda...</p>
          </div>
        ) : (
          categories.map((cat: import('@/types').Category) => {
            const IconComp = ICON_MAP[cat.icon || ''] || Wrench;
            return (
              <div
                key={cat.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.25)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'rgba(108,99,255,0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconComp size={26} />
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    title="O'chirish"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--danger)', opacity: 0.5, padding: 8, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'opacity 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.5';
                      (e.currentTarget as HTMLElement).style.background = 'none';
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{cat.name}</h3>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {cat.subCategories?.length || 0} ta subkategoriya • 0 ta usta
                  </p>
                </div>
              </div>
            );
          })
        )}

        {categories.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1/-1', padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <FolderTree size={40} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Kategoriyalar mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  );
}
