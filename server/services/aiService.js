import ort from 'onnxruntime-node';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(__dirname, '../models/model.onnx');
const INPUT_SIZE = 640;
let session = null;

// Class mapping – same as your notebook
const KEEP_IDS = [1,3,4,5,6,8,9,10,13,14,15,17,18,19,20,22,24,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,48,49,50,51,52,54,57,58,59,61,64,66,67,69,70,71,73,76,79,80,82,83,84,87,90,91,92,93,94,95,96,97,98,102,103];

const CLASS_NAMES = {
  1: 'candy', 3: 'french fries', 4: 'chocolate', 5: 'biscuit', 6: 'popcorn',
  8: 'ice cream', 9: 'cheese butter', 10: 'cake', 13: 'coffee', 14: 'juice',
  15: 'milk', 17: 'almond', 18: 'red beans', 19: 'cashew', 20: 'dried cranberries',
  22: 'walnut', 24: 'egg', 25: 'apple', 27: 'apricot', 28: 'avocado',
  29: 'banana', 30: 'strawberry', 31: 'cherry', 32: 'blueberry', 33: 'raspberry',
  34: 'mango', 35: 'olives', 36: 'peach', 37: 'lemon', 38: 'pear',
  39: 'fig', 40: 'pineapple', 41: 'grape', 42: 'kiwi', 43: 'melon',
  44: 'orange', 45: 'watermelon', 46: 'steak', 48: 'chicken duck', 49: 'sausage',
  50: 'fried meat', 51: 'lamb', 52: 'sauce', 54: 'fish', 57: 'soup',
  58: 'bread', 59: 'corn', 61: 'pizza', 64: 'pasta', 66: 'rice',
  67: 'pie', 69: 'eggplant', 70: 'potato', 71: 'garlic', 73: 'tomato',
  76: 'spring onion', 79: 'okra', 80: 'lettuce', 82: 'cucumber', 83: 'white radish',
  84: 'carrot', 87: 'broccoli', 90: 'snow peas', 91: 'cabbage', 92: 'bean sprouts',
  93: 'onion', 94: 'pepper', 95: 'green beans', 96: 'french beans',
  97: 'king oyster mushroom', 98: 'shiitake', 102: 'salad', 103: 'other ingredients'
};

const classNamesList = KEEP_IDS.map(id => CLASS_NAMES[id]);

async function loadModel() {
  if (!session) {
    session = await ort.InferenceSession.create(MODEL_PATH);
    console.log('✅ ONNX model loaded');
  }
  return session;
}

async function preprocessImage(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .resize(INPUT_SIZE, INPUT_SIZE, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const r = data[i * 3] / 255.0;
    const g = data[i * 3 + 1] / 255.0;
    const b = data[i * 3 + 2] / 255.0;
    pixels[i] = r;
    pixels[i + INPUT_SIZE * INPUT_SIZE] = g;
    pixels[i + 2 * INPUT_SIZE * INPUT_SIZE] = b;
  }
  return new ort.Tensor('float32', pixels, [1, 3, INPUT_SIZE, INPUT_SIZE]);
}

export async function detectFood(imageBuffer) {
  await loadModel();
  const tensor = await preprocessImage(imageBuffer);
  // Note: input node name may differ; use Netron to check
  const feeds = { images: tensor };
  const results = await session.run(feeds);
  const output = results.output0;
  const data = output.data;
  const dims = output.dims; // [1,84,8400]
  const numBoxes = dims[2];
  const numClasses = 73;

  let bestScore = 0;
  let bestClassId = -1;

  for (let i = 0; i < numBoxes; i++) {
    const startIdx = i * 84;
    for (let c = 0; c < numClasses; c++) {
      const score = data[startIdx + 4 + c];
      if (score > bestScore) {
        bestScore = score;
        bestClassId = c;
      }
    }
  }

  if (bestClassId === -1) throw new Error('No food detected');
  const foodName = classNamesList[bestClassId];
  const confidence = (bestScore * 100).toFixed(1);

  return { foodName, confidence: parseFloat(confidence) };
}