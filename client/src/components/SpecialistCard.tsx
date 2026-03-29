import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, Wrench } from 'lucide-react';

export interface SpecialistCardProps {
  id: string;
  name: string;
  rating: number;
  reviewCount?: number;
  isVerified: boolean;
  location?: string;
  etaMinutes?: number;           // estimated arrival in minutes
  completedOrders?: number;
  categoryName?: string;
  animationDelay?: number;       // stagger entrance (ms)
  onHire?: () => void;
}

export default function SpecialistCard({
  id,
  name,
  rating,
  reviewCount = 0,
  isVerified,
  location,
  etaMinutes,
  completedOrders = 0,
  categoryName,
  animationDelay = 0,
  onHire,
}: SpecialistCardProps) {
  const navigate = useNavigate();
  const initial = name?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className="specialist-card animate-card-in"
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => navigate(`/specialists/${id}`)}
      role="button"
      tabIndex={0}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--primary-glow)', filter: 'blur(24px)',
        opacity: 0.4, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 20,
          fontFamily: 'Poppins, sans-serif',
          boxShadow: '0 4px 16px var(--primary-glow)',
        }}>
          {initial}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontWeight: 800, fontSize: 15, color: 'var(--text)',
              fontFamily: 'Poppins, sans-serif',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {name}
            </span>
            {isVerified && (
              <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Rating */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 12, fontWeight: 700, color: '#FBBF24',
            }}>
              <Star size={11} fill="#FBBF24" />
              {rating > 0 ? rating.toFixed(1) : 'Yangi'}
              {reviewCount > 0 && (
                <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
                  ({reviewCount})
                </span>
              )}
            </span>

            {/* Completed */}
            {completedOrders > 0 && (
              <span style={{
                fontSize: 11, color: 'var(--accent)', fontWeight: 600,
                background: 'rgba(52,211,153,0.1)', padding: '1px 7px', borderRadius: 50,
              }}>
                {completedOrders}+ ish
              </span>
            )}

            {/* Location */}
            {location && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 11, color: 'var(--text-sub)',
              }}>
                <MapPin size={9} />
                {location.split(',')[0]}
              </span>
            )}
          </div>

          {/* Category */}
          {categoryName && (
            <div style={{
              marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--text-sub)',
            }}>
              <Wrench size={10} />
              {categoryName}
            </div>
          )}
        </div>

        {/* ETA Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          {etaMinutes != null && etaMinutes > 0 ? (
            <span className="eta-badge">
              <Clock size={10} />
              {etaMinutes} min
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
              background: 'var(--bg-elev)', padding: '3px 9px', borderRadius: 50,
              border: '1px solid var(--border)',
            }}>
              Bo'sh
            </span>
          )}

          {/* Hire button */}
          {onHire && (
            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: 12, borderRadius: 10, height: 'auto', width: 'auto' }}
              onClick={e => { e.stopPropagation(); onHire(); }}
            >
              Chaqirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
