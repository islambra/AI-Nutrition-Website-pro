import { Flame, Droplets, Beef, Wheat, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame, color: '#f59e0b' },
  { key: 'protein_g', label: 'Protein', unit: 'g', icon: Beef, color: '#22C55E' },
  { key: 'fat_g', label: 'Fat', unit: 'g', icon: Droplets, color: '#ef4444' },
  { key: 'carbohydrates_g', label: 'Carbs', unit: 'g', icon: Wheat, color: '#6366f1' },
];

const NutritionCard = ({ dishName, nutrition }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="nc-card"
    style={{
      background: 'white', borderRadius: 20, border: '1px solid #eef2f6',
      padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <Sparkles size={20} color="#22C55E" />
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
        {dishName}
      </h3>
    </div>
    <div className="nc-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12
    }}>
      {METRICS.map(({ key, label, unit, icon: Icon, color }) => (
        <div key={key} className="nc-metric" style={{
          background: '#f8fafc', borderRadius: 14, padding: '16px 14px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Icon size={18} color={color} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {label}
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            {nutrition?.[key] ?? '—'}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginLeft: 4 }}>
              /{unit}
            </span>
          </span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>
      Per 100g
    </p>
  </motion.div>
);

export default NutritionCard;
