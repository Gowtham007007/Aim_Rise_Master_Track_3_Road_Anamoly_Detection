import os
import cv2
import numpy as np
from tkinter import Tk, Label
from PIL import Image, ImageTk

# -------------------------
# CONFIGURATION
# -------------------------
BASE       = os.path.expanduser("~/arm/pothole_project")
VIDEO_PATH = os.path.join(BASE, "road6.mp4")
MODEL_PATH = os.path.join(BASE, "best.onnx")

ALL_CLASS_NAMES = [
    "longitudinal_crack",   # 0
    "transverse_crack",     # 1
    "alligator_crack",      # 2
    "pothole",              # 3
    "repair",               # 4
    "other",                # 5
    "barrier",              # 6
    "cone"                  # 7
]

WANTED_CLASSES = {
    "longitudinal_crack",
    "transverse_crack",
    "alligator_crack",
    "pothole"
}

CLASS_COLORS = {
    "longitudinal_crack": (0,   165, 255),  # orange
    "transverse_crack":   (0,   220,   0),  # green
    "alligator_crack":    (255,  80,  80),  # blue
    "pothole":            (0,     0, 255),  # red
}

SHORT_NAMES = {
    "longitudinal_crack": "L-crack",
    "transverse_crack":   "T-crack",
    "alligator_crack":    "Allig",
    "pothole":            "POTHOLE",
}

# ── Tune these 4 values only ──────────────────────────────
INPUT_SIZE    = 320     # reduced from 640 → ~4x faster inference on Pi
CONF_THRESH   = 0.65    # raised → far fewer false positives
NMS_THRESH    = 0.30    # aggressive overlap removal
MAX_DET       = 5       # never draw more than 5 boxes
MAX_BOX_RATIO = 0.55    # reject boxes larger than 55% of frame width/height
POTHOLE_CONF  = 0.45    # pothole-specific lower threshold
INFER_EVERY   = 3       # run inference only every N frames → big latency drop
# ─────────────────────────────────────────────────────────

# -------------------------
# LOAD MODEL & VIDEO
# -------------------------
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
if not os.path.exists(VIDEO_PATH):
    raise FileNotFoundError(f"Video not found: {VIDEO_PATH}")

net = cv2.dnn.readNetFromONNX(MODEL_PATH)
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
cv2.setNumThreads(4)
output_layers = net.getUnconnectedOutLayersNames()
print(f"[INFO] Model loaded | Input: {INPUT_SIZE}px | Infer every {INFER_EVERY} frames")

cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise RuntimeError(f"Cannot open video: {VIDEO_PATH}")

# -------------------------
# STATE — reuse last detections on skipped frames
# -------------------------
last_annotations = []   # list of (x, y, w, h, class_name, conf)
frame_count       = 0

# -------------------------
# DETECTION
# -------------------------
def parse_detections(preds, w_orig, h_orig):
    results = []

    for raw in preds:
        output = raw[0] if len(raw.shape) == 3 else raw
        if output.shape[0] < output.shape[1]:
            output = output.T

        for det in output:
            class_scores = det[4: 4 + len(ALL_CLASS_NAMES)]
            class_id     = int(np.argmax(class_scores))
            confidence   = float(class_scores[class_id])
            class_name   = ALL_CLASS_NAMES[class_id]

            if class_name not in WANTED_CLASSES:
                continue

            threshold = POTHOLE_CONF if class_name == "pothole" else CONF_THRESH
            if confidence < threshold:
                continue

            cx, cy, bw, bh = det[0], det[1], det[2], det[3]
            sx = w_orig / INPUT_SIZE
            sy = h_orig / INPUT_SIZE

            x = int((cx - bw / 2) * sx)
            y = int((cy - bh / 2) * sy)
            w = int(bw * sx)
            h = int(bh * sy)

            x = max(0, x);  y = max(0, y)
            w = min(w, w_orig - x)
            h = min(h, h_orig - y)

            if w <= 0 or h <= 0:
                continue

            # Reject giant false-positive boxes
            if w / w_orig > MAX_BOX_RATIO or h / h_orig > MAX_BOX_RATIO:
                continue

            results.append(([x, y, w, h], confidence, class_name))

    if not results:
        return []

    boxes     = [r[0] for r in results]
    confs     = [r[1] for r in results]
    names     = [r[2] for r in results]

    indices = cv2.dnn.NMSBoxes(boxes, confs, CONF_THRESH, NMS_THRESH)
    if len(indices) == 0:
        return []

    flat = indices.flatten()
    flat = sorted(flat, key=lambda i: confs[i], reverse=True)[:MAX_DET]

    return [(boxes[i][0], boxes[i][1], boxes[i][2], boxes[i][3],
             names[i], confs[i]) for i in flat]


def draw_annotations(frame, annotations):
    for (x, y, bw, bh, class_name, conf) in annotations:
        color = CLASS_COLORS[class_name]
        label = f"{SHORT_NAMES[class_name]} {conf:.2f}"

        # Thin box outline
        cv2.rectangle(frame, (x, y), (x + bw, y + bh), color, 2)

        # Corner ticks — visually light, doesn't block video
        tick = min(10, bw // 5, bh // 5)
        for px, py, dx, dy in [
            (x,        y,        1,  1),
            (x + bw,   y,       -1,  1),
            (x,        y + bh,   1, -1),
            (x + bw,   y + bh,  -1, -1),
        ]:
            cv2.line(frame, (px, py), (px + dx * tick, py), color, 2)
            cv2.line(frame, (px, py), (px, py + dy * tick), color, 2)

        # Compact label above box
        font = cv2.FONT_HERSHEY_SIMPLEX
        fs   = 0.42
        (tw, th), bl = cv2.getTextSize(label, font, fs, 1)
        ly = max(y - 3, th + bl + 2)

        cv2.rectangle(frame,
                      (x, ly - th - bl - 2),
                      (x + tw + 4, ly + 1),
                      color, cv2.FILLED)
        cv2.putText(frame, label, (x + 2, ly - bl),
                    font, fs, (0, 0, 0), 1, cv2.LINE_AA)

    # HUD
    cv2.putText(frame, f"Det: {len(annotations)}",
                (8, 22), cv2.FONT_HERSHEY_SIMPLEX,
                0.60, (255, 255, 255), 2, cv2.LINE_AA)


# -------------------------
# TKINTER DISPLAY
# -------------------------
root = Tk()
root.attributes("-fullscreen", True)
root.configure(bg="black")
root.bind("<Escape>", lambda e: (cap.release(), root.destroy()))

video_label = Label(root, bg="black")
video_label.pack(fill="both", expand=True)

root.update()
root.update_idletasks()

disp_w = root.winfo_width()
disp_h = root.winfo_height()
if disp_w < 100 or disp_h < 100:
    disp_w, disp_h = 1280, 720

print(f"[INFO] Display: {disp_w}x{disp_h}")


def update_frame():
    global last_annotations, frame_count

    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        root.after(1, update_frame)
        return

    frame_count += 1

    # ── Run inference only every INFER_EVERY frames ──
    if frame_count % INFER_EVERY == 0:
        try:
            blob = cv2.dnn.blobFromImage(
                frame, 1 / 255.0, (INPUT_SIZE, INPUT_SIZE),
                swapRB=True, crop=False
            )
            net.setInput(blob)
            preds = net.forward(output_layers)
            h, w  = frame.shape[:2]
            last_annotations = parse_detections(preds, w, h)
        except Exception as e:
            print(f"[Inference error] {e}")

    # ── Always draw last known boxes (smooth across skipped frames) ──
    draw_annotations(frame, last_annotations)

    # ── Resize once to display size ──
    display = cv2.resize(frame, (disp_w, disp_h), interpolation=cv2.INTER_LINEAR)

    img_rgb = cv2.cvtColor(display, cv2.COLOR_BGR2RGB)
    img_tk  = ImageTk.PhotoImage(Image.fromarray(img_rgb))
    video_label.config(image=img_tk)
    video_label.image = img_tk

    root.after(15, update_frame)


update_frame()
root.mainloop()
cap.release()
