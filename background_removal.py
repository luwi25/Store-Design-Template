"""Local product cutouts; model inference never uploads the user's image."""
import base64
from io import BytesIO
import os
from pathlib import Path
import threading
import hashlib
import urllib.request

MODEL_ROOT = Path(__file__).resolve().parent / 'data' / 'models'
os.environ['OMP_NUM_THREADS'] = '2'
_lock = threading.Lock()
_session = None


def session():
    global _session
    if _session is None:
        import cv2
        model = MODEL_ROOT / 'u2net.onnx'
        if not model.exists():
            raise ValueError('The background removal model is missing. Run Setup Background Removal.cmd first.')
        cv2.setNumThreads(2)
        _session = cv2.dnn.readNetFromONNX(str(model))
        _session.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        _session.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
    return _session


def remove_background(data_url):
    from PIL import Image, ImageOps, ImageChops
    import numpy as np
    if not isinstance(data_url, str) or not data_url.startswith(('data:image/png;base64,', 'data:image/jpeg;base64,', 'data:image/webp;base64,')):
        raise ValueError('Choose a PNG, JPEG or WebP photo.')
    if len(data_url) > 28 * 1024 * 1024:
        raise ValueError('Choose an image smaller than 20 MB.')
    try:
        raw = base64.b64decode(data_url.split(',', 1)[1], validate=True)
        with Image.open(BytesIO(raw)) as source:
            if source.width * source.height > 24_000_000:
                raise ValueError('Choose an image with fewer than 24 million pixels.')
            image = ImageOps.exif_transpose(source).convert('RGBA')
    except (OSError, Image.DecompressionBombError) as error:
        raise ValueError('This image could not be read. Choose another PNG, JPEG or WebP.') from error
    alpha = image.getchannel('A')
    if alpha.getextrema()[1] == 0:
        raise ValueError('This image is already completely transparent.')
    # Only one inference runs at a time to keep memory usage predictable.
    with _lock:
        network = session()
        rgb = np.asarray(image.convert('RGB').resize((320, 320), Image.Resampling.LANCZOS), dtype=np.float32)
        rgb /= max(float(rgb.max()), 1e-6)
        normalized = (rgb - np.array([.485, .456, .406], dtype=np.float32)) / np.array([.229, .224, .225], dtype=np.float32)
        network.setInput(normalized.transpose(2, 0, 1)[None])
        prediction = network.forward(network.getUnconnectedOutLayersNames()[0]).squeeze()
        span = float(prediction.max() - prediction.min())
        if span < 1e-6:
            raise ValueError('No clear foreground was detected. Your original photo has been kept.')
        prediction = (prediction - prediction.min()) / span
        mask = Image.fromarray((prediction * 255).clip(0, 255).astype('uint8')).resize(image.size, Image.Resampling.LANCZOS)
    result = image.copy()
    result.putalpha(ImageChops.multiply(mask, alpha))
    if result.getchannel('A').getextrema()[1] == 0:
        raise ValueError('No foreground was detected. Your original photo has been kept.')
    output = BytesIO()
    result.save(output, format='PNG')
    return {'image': 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode('ascii'), 'width': result.width, 'height': result.height}


if __name__ == '__main__':
    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    model = MODEL_ROOT / 'u2net.onnx'
    if not model.exists():
        urllib.request.urlretrieve('https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx', model)
    if hashlib.md5(model.read_bytes()).hexdigest() != '60024c5c889badc19c04ad937298a77b':
        raise RuntimeError('The model download is incomplete. Remove data/models/u2net.onnx and run setup again.')
    session()
    print('Background removal model is installed and ready.')
