import { useState } from 'react';
import { Copy, Check, Share2, Users, Gift, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetMyReferralLinkQuery } from '../store/apiSlice';

interface ReferralSectionProps {
  userId?: string; // fallback uchun
  referralCode?: string;
  referredCount?: number;
  bonusPercent?: number;
}

export default function ReferralSection({
  userId,
  referralCode: propCode,
  referredCount: propCount = 0,
  bonusPercent: propBonus = 10,
}: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  // Real API dan ma'lumotlar
  const { data: refData, isLoading } = useGetMyReferralLinkQuery();

  const code = refData?.data?.referralCode || propCode || (userId?.slice(0, 8).toUpperCase() ?? 'XXXXXXXX');
  const referralLink = refData?.data?.referralLink || `https://profix.uz/ref/${code}`;
  const referredCount = refData?.data?.referredCount ?? propCount;
  const bonusPercent = refData?.data?.bonusPercent ?? propBonus;
  const bonusBalance = refData?.data?.bonusBalance ?? 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Havola nusxalandi! 🎉');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Nusxalashda xatolik');
    }
  };

  const handleShare = () => {
    const text = `ProFix.uz orqali usta chaqiring — tez, ishonchli, arzon! 🔧\n\n${referralLink}`;
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`
      );
    } else if (navigator.share) {
      navigator.share({ title: 'ProFix.uz', text, url: referralLink });
    } else {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
        '_blank'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="referral-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }


  return (
    <div className="referral-card">
      {/* Shine overlay */}
      <div className="referral-shine" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Gift size={22} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', fontFamily: 'Poppins, sans-serif' }}>
            Do'stingni taklif qil
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 1 }}>
            Do'sting buyurtma bersa — sizga {bonusPercent}% chegirma!
          </p>
        </div>
      </div>

      {/* Stats row */}
      {referredCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
          background: 'rgba(52,211,153,0.08)', borderRadius: 12, padding: '10px 14px',
          border: '1px solid rgba(52,211,153,0.2)',
        }}>
          <Users size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{referredCount}</span> ta do'st taklif qildingiz
          </span>
          {referredCount >= 1 && (
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 800,
              color: 'var(--warning)', background: 'rgba(251,191,36,0.1)',
              padding: '2px 8px', borderRadius: 50,
            }}>
              🎁 {bonusPercent}% chegirma faol
            </span>
          )}
        </div>
      )}

      {/* Referral link box */}
      <div
        className="referral-link-box"
        onClick={handleCopy}
        role="button"
        title="Nusxalash uchun bosing"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {referralLink}
        </span>
        <div style={{ flexShrink: 0 }}>
          {copied
            ? <Check size={16} style={{ color: 'var(--accent)' }} />
            : <Copy size={16} style={{ color: 'var(--text-sub)' }} />
          }
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          className="btn btn-ghost"
          style={{ borderRadius: 12, height: 44, fontSize: 13, flex: 1 }}
          onClick={handleCopy}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Nusxalandi!' : 'Nusxalash'}
        </button>
        <button
          className="btn btn-gradient"
          style={{ borderRadius: 12, height: 44, fontSize: 13, flex: 1 }}
          onClick={handleShare}
        >
          <Share2 size={16} />
          Do'stlarga yuborish
        </button>
      </div>

      {/* How it works */}
      <div style={{ marginTop: 14, display: 'flex', gap: 6, flexDirection: 'column' }}>
        {[
          { emoji: '1️⃣', text: 'Havolangizni do\'stlaringizga yuboring' },
          { emoji: '2️⃣', text: 'Do\'stingiz birinchi usta chaqirsin' },
          { emoji: '3️⃣', text: 'Sizning keyingi buyurtmangizdan 10% chegirma!' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{item.emoji}</span>
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
