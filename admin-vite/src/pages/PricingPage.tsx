import { useState } from 'react';
import { useGetCategoriesQuery, useGetAdminPricingQuery, useCreatePriceItemMutation, useUpdatePriceItemMutation, useDeletePriceItemMutation } from '@/store/adminApiSlice';
import toast from 'react-hot-toast';
import { Banknote, Plus, X, Trash2, Edit2, Loader2, FolderOpen } from 'lucide-react';
import type { PriceItem } from '@/types';

const S = {
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', outline: 'none' } as React.CSSProperties,
  label: { fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '1px', display: 'block', marginBottom: '8px' },
};

export default function PricingPage() {
  const { data: catRes, isLoading: catLoading } = useGetCategoriesQuery();
  const categories = catRes?.data || [];
  
  const [selectedCat, setSelectedCat] = useState<string>('');
  const { data: priceRes, isLoading: priceLoading } = useGetAdminPricingQuery(selectedCat ? { categoryId: selectedCat } : {});
  const priceItems = priceRes?.data || [];

  const [createItem] = useCreatePriceItemMutation();
  const [updateItem] = useUpdatePriceItemMutation();
  const [deleteItem] = useDeletePriceItemMutation();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PriceItem | null>(null);

  const [form, setForm] = useState({
    categoryId: '', name: '', unit: 'xizmat', minPrice: '', maxPrice: '', description: '', isActive: true, sortOrder: '0'
  });

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.name || !form.minPrice) {
      return toast.error("Kategoriya, nom va minimal narx kiritilishi shart");
    }

    try {
      if (editing) {
        await updateItem({
          id: editing.id,
          ...form,
          minPrice: Number(form.minPrice),
          maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
          sortOrder: Number(form.sortOrder),
        }).unwrap();
        toast.success("Narx yangilandi");
      } else {
        await createItem({
          ...form,
          minPrice: Number(form.minPrice),
          maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
          sortOrder: Number(form.sortOrder),
        }).unwrap();
        toast.success("Narx qo'shildi");
      }
      resetForm();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" narxini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteItem(id).unwrap();
      toast.success("O'chirildi");
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const startEdit = (item: PriceItem) => {
    setEditing(item);
    setAdding(false);
    setForm({
      categoryId: item.categoryId,
      name: item.name,
      unit: item.unit,
      minPrice: item.minPrice.toString(),
      maxPrice: item.maxPrice ? item.maxPrice.toString() : '',
      description: item.description || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder.toString()
    });
  };

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setForm({ categoryId: '', name: '', unit: 'xizmat', minPrice: '', maxPrice: '', description: '', isActive: true, sortOrder: '0' });
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Banknote size={30} color="var(--primary)" /> Narxlar Jadvali
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Xizmatlar narxi va ta'riflarini boshqarish</p>
        </div>
        <button
          onClick={() => { resetForm(); setAdding(true); }}
          className="shrink-0 whitespace-nowrap"
          style={{
            padding: '10px 20px', borderRadius: 14, fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(108,99,255,0.25)',
          }}
        >
          <Plus size={16} /> Yangi narx
        </button>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
         <button
            onClick={() => setSelectedCat('')}
            style={{ 
              padding: '8px 16px', borderRadius: 12, border: '1px solid var(--border)', 
              background: !selectedCat ? 'var(--primary)' : 'var(--bg-card)', 
              color: !selectedCat ? '#fff' : 'var(--text)',
              whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 600
            }}
          >
            Barchasi
          </button>
        {categories.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            style={{ 
              padding: '8px 16px', borderRadius: 12, border: '1px solid var(--border)', 
              background: selectedCat === c.id ? 'var(--primary)' : 'var(--bg-card)', 
              color: selectedCat === c.id ? '#fff' : 'var(--text)',
              whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 600
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <form onSubmit={handleCreateOrUpdate} className="bg-[var(--bg-card)] border-2 border-[var(--primary)] rounded-2xl p-6 mb-8" style={{ boxShadow: '0 10px 40px rgba(108,99,255,0.12)' }}>
          <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
             <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
               {editing ? "Narxni tahrirlash" : "Yangi narx qo'shish"}
             </h2>
             <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <div>
              <label style={S.label}>Kategoriya</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={S.input} required>
                <option value="">Tanlang...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Xizmat nomi</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={S.input} placeholder="Oshxona rakovinasi o'rnatish"/>
            </div>
            <div>
              <label style={S.label}>O'lchov birligi</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={S.input} placeholder="dona, kv.m, metr, soat"/>
            </div>
            <div>
              <label style={S.label}>Tartib raqami (Sort)</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={S.input}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            <div>
              <label style={S.label}>Minimal narx (so'm)</label>
              <input type="number" value={form.minPrice} onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))} required style={S.input} placeholder="50000"/>
            </div>
            <div>
              <label style={S.label}>Maksimal narx (ixtiyoriy)</label>
              <input type="number" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} style={S.input} placeholder="150000"/>
            </div>
            <div className="lg:col-span-2">
              <label style={S.label}>Holati</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>
                   <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Faol
                 </label>
              </div>
            </div>
          </div>

          <div className="mt-5 text-right">
             <button type="submit" style={{ padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 800, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(108,99,255,0.25)' }}>
                {editing ? 'Saqlash' : 'Qo\'shish'}
             </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        {priceLoading || catLoading ? (
           <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
             <Loader2 size={36} className="animate-spin" />
             <p>Narxlar yuklanmoqda...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Xizmat Nomi</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Kategoriya</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Narx / Birlik</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {priceItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', color: 'var(--text)', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                        {item.category?.name || 'Noma\'lum'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text)' }}>
                      <span className="font-mono">{item.minPrice.toLocaleString()} {item.maxPrice ? ` – ${item.maxPrice.toLocaleString()}` : ''} so'm</span> <span className="text-gray-500 text-sm">/ {item.unit}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 8, background: item.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: item.isActive ? 'var(--success)' : 'var(--danger)', fontSize: 12, fontWeight: 700 }}>
                        {item.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
                      <button onClick={() => startEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--text)', opacity: 0.6, cursor: 'pointer' }}><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(item.id, item.name)} style={{ background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.6, cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {priceItems.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div className="flex flex-col items-center gap-3">
                        <FolderOpen size={32} style={{ opacity: 0.3 }} />
                        <span>Narxlar kiritilmagan</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
