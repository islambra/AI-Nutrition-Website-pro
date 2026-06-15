import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Image, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import NutritionCard from './NutritionCard';
import LoadingSpinner from './LoadingSpinner';
import './FoodScanner.css';

const MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.0-flash-lite-001',
  'openai/gpt-4o-mini',
];

const ANALYSIS_PROMPT = `You are a professional nutritionist. Analyze this food image and return ONLY valid JSON with no extra text:
{
  "dish_name": "string",
  "nutrition_per_100g": {
    "calories": "number (kcal per 100g)",
    "protein_g": "number (grams of protein per 100g)",
    "fat_g": "number (grams of fat per 100g)",
    "carbohydrates_g": "number (grams of carbohydrates per 100g)"
  }
}
Rules:
- Estimate realistic nutritional values based on standard food databases
- If multiple foods, analyze the main dish
- Return ONLY JSON, no explanations or extra text`;

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB limit

const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    if (file.size <= MAX_IMAGE_SIZE) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    // Resize large images to avoid WebSocket payload issues
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 1024;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = (height / width) * maxDim; width = maxDim; }
        else { width = (width / height) * maxDim; height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

const FoodScanner = () => {
  const [state, setState] = useState('idle'); // idle | preview | scanning | done
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setState('idle');
    setImageFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError('');
  }, [previewUrl]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState('preview');
    setResults(null);
    setError('');
  }, [previewUrl]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const startScan = async () => {
    if (!imageFile) return;
    if (typeof puter === 'undefined') {
      toast.error('AI engine not loaded. Please refresh the page.');
      return;
    }

    setState('scanning');
    setError('');
    const loadingToast = toast.loading('Analyzing your food...');

    try {
      const imageDataUri = await resizeImage(imageFile);

      let response = null;

      for (const model of MODELS) {
        try {
          response = await puter.ai.chat([
            {
              role: 'user',
              content: [
                { type: 'text', text: ANALYSIS_PROMPT },
                { type: 'image_url', image_url: { url: imageDataUri } }
              ]
            }
          ], { model });
          if (response) break;
        } catch (e) {
          console.warn(`Model ${model} failed:`, e);
          continue;
        }
      }

      if (!response) {
        throw new Error('All AI models failed. Please try again later.');
      }

      // Extract text from response (OpenAI-compat format)
      let text = '';
      if (typeof response === 'string') {
        text = response;
      } else if (response.message?.content) {
        text = response.message.content;
      } else if (response.text) {
        text = response.text;
      } else if (response.response) {
        text = typeof response.response === 'string' ? response.response : response.response.text || '';
      } else {
        text = JSON.stringify(response);
      }

      // Strip markdown code fences
      const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Try to extract JSON from the response
        const jsonMatch = cleaned.match(/\{[\s\S]*"dish_name"[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse nutrition data from AI response.');
        }
      }

      const nutrition = parsed.nutrition_per_100g || {};
      setResults({
        dishName: parsed.dish_name || 'Unknown Dish',
        nutrition: {
          calories: Number(nutrition.calories) || 0,
          protein_g: Number(nutrition.protein_g) || 0,
          fat_g: Number(nutrition.fat_g) || 0,
          carbohydrates_g: Number(nutrition.carbohydrates_g) || 0,
        },
      });

      setState('done');
      toast.dismiss(loadingToast);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.dismiss(loadingToast);
      const msg = err.message || 'Analysis failed';
      setError(msg);
      toast.error(msg);
      setState('preview');
    }
  };

  return (
    <div className="fs-wrapper">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fs-upload ${dragOver ? 'fs-drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="fs-upload-icon">
              <Upload size={40} />
            </div>
            <h3>Upload a food image</h3>
            <p>Click or drag & drop a photo of your meal</p>
            <span className="fs-hint">JPG, PNG, WEBP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </motion.div>
        )}

        {(state === 'preview' || state === 'scanning') && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fs-preview"
          >
            <div className="fs-image-wrap">
              <img src={previewUrl} alt="Food preview" className="fs-image" />
              {state === 'scanning' && (
                <div className="fs-scan-overlay">
                  <LoadingSpinner size={36} text="Analyzing with AI..." />
                </div>
              )}
            </div>

            {error && (
              <div className="fs-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="fs-actions">
              {state === 'preview' && (
                <>
                  <button className="fs-btn fs-btn-primary" onClick={startScan}>
                    <Zap size={18} /> Analyze
                  </button>
                  <button className="fs-btn fs-btn-ghost" onClick={() => fileInputRef.current?.click()}>
                    <Image size={18} /> Change
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {state === 'done' && results && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fs-done"
          >
            <NutritionCard dishName={results.dishName} nutrition={results.nutrition} />
            <button className="fs-btn fs-btn-primary fs-reset-btn" onClick={reset}>
              <RefreshCw size={18} /> Scan Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodScanner;
