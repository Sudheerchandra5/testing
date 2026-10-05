"""Small feed-forward classifier for image inputs (e.g. MNIST)."""

from __future__ import annotations

import torch
from torch import nn


class SimpleClassifier(nn.Module):
    """Two-layer MLP with dropout, configurable input size and class count."""

    def __init__(
        self,
        input_size: int = 28 * 28,
        hidden_size: int = 256,
        num_classes: int = 10,
        dropout: float = 0.2,
    ) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(input_size, hidden_size),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
