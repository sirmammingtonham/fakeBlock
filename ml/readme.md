# fakeBlock Machine Learning Models and Scripts

The [`modeling/`](modeling/) folder contains transformer neural network architectures modified for fakeBlock. We use a [distilBERT](https://arxiv.org/abs/1910.01108) base with two separate linear layer outputs—one for outputting an overall text reliability score and the other for outputting tag scores.

The root `ml/` folder contains python scripts and jupyter notebooks used for:
  - Converting csv/sql datasets into a TensorFlow and PyTorch friendly format.
  - Training/finetuning transformer deep neural networks for text classification with the [Huggingface Transformer](https://github.com/huggingface/transformers) library (using TensorFlow).
  - Converting neural network model checkpoints to TensorFlow SavedModel, then sharding SavedModel into a web friendly TensorFlow.js format.

Current models were trained on [NELA-GT-2020](https://arxiv.org/abs/2102.04567): A Large Multi-Labelled News Dataset for The Study of Misinformation in News Articles.

Reliability categories:
  - Reliable
  - Mixed
  - Unreliable

Tag categories:
  - Conspiracy Pseudoscience
  - Unbiased
  - Left Bias
  - Left Center Bias
  - Questionable Source
  - Right Bias
  - Right Center Bias
  - NA