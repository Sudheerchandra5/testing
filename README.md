# testing

Minimal PyTorch project with a custom **`SimpleClassifier`** model (MLP for 28×28 images).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Train

```bash
python train.py --epochs 5 --out checkpoints/model.pt
```

## Model

- **`models/simple_classifier.py`** — define architecture (`input_size`, `hidden_size`, `num_classes`, `dropout`).
- Extend or copy this module to add new model variants.
