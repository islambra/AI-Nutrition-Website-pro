import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Droplets, Beef, Wheat, Sparkles, Hash } from 'lucide-react';

const METRICS = [
  { key: 'calories', unit: 'kcal', icon: Flame, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'protein_g', unit: 'g', icon: Beef, color: '#22C55E', bg: '#f0fdf4' },
  { key: 'fat_g', unit: 'g', icon: Droplets, color: '#ef4444', bg: '#fef2f2' },
  { key: 'carbohydrates_g', unit: 'g', icon: Wheat, color: '#6366f1', bg: '#eef2ff' },
];

const AnimatedNumber = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    const from = 0;
    const to = value;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  return <>{display}{suffix}</>;
};

const NutritionCard = ({ dishName, nutrition }) => {
  const { t } = useTranslation();
  const vals = nutrition || {};
  const cals = Number(vals.calories) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        borderRadius: 24,
        border: '1px solid #e5e7eb',
        padding: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #22C55E, #16A34A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
        }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>
            {dishName}
          </h3>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{t('nutritionCard.nutritionPer100g')}</span>
        </div>
      </div>

      {/* Big Calorie Callout */}
      <div style={{
        textAlign: 'center',
        padding: '16px 0 18px',
        marginBottom: 18,
        background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
        borderRadius: 16,
        border: '1px solid #fde68a',
      }}>
        <span style={{ fontSize: 38, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>
          <AnimatedNumber value={cals} />
        </span>
        <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginTop: 2 }}>
          {t('nutritionCard.kcalPer100g')}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {METRICS.map(({ key, unit, icon: Icon, color, bg }, idx) => {
          const label = t('nutritionCard.' + key);
          const val = Number(vals[key]) || 0;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06 }}
              style={{
                background: bg,
                borderRadius: 14,
                padding: '14px',
                border: `1px solid ${color}15`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon size={14} color={color} />
                <span style={{
                  fontSize: 10, fontWeight: 600, color,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {label}
                </span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                <AnimatedNumber value={val} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginLeft: 3 }}>
                  /{unit}
                </span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NutritionCard;
