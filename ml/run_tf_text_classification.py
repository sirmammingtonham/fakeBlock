#!/usr/bin/env python
# coding=utf-8
# Copyright 2020 The HuggingFace Team. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
""" Fine-tuning the library models for sequence classification."""


import logging
import os
from dataclasses import dataclass, field
from typing import Dict, Optional

import datasets
import numpy as np
import tensorflow as tf

from transformers import (
    AutoConfig,
    AutoTokenizer,
    EvalPrediction,
    HfArgumentParser,
    PreTrainedTokenizer,
    # TFAutoModelForSequenceClassification,
    TFTrainer,
    TFTrainingArguments,
)
from transformers.utils import logging as hf_logging

from modeling.multi_output_distilbert import TFDistilBertForFakeNewsClassification # type: ignore


hf_logging.set_verbosity_info()
hf_logging.enable_default_handler()
hf_logging.enable_explicit_format()

def get_tfds(
    path: str,
    tokenizer: PreTrainedTokenizer,
    max_seq_length: Optional[int] = None,
):
    ds = datasets.load_from_disk(path)
    ds = ds.rename_column('aggregated_label', 'labels_aggregate').rename_column(
        'Media Bias / Fact Check, label', 'labels_category')
    input_names = tokenizer.model_input_names
    transformed_ds = ds.map(
        lambda example: tokenizer(
            example['content'],
            truncation=True,
            max_length=max_seq_length,
            padding="max_length",
        ),
        batched=True,
    )

    def gen_train():
        for ex in transformed_ds["train"]:
            yield {k: v for k, v in ex.items() if k in input_names}, (ex['labels_aggregate'], ex['labels_category'])

    def gen_val():
        for ex in transformed_ds["valid"]:
            yield {k: v for k, v in ex.items() if k in input_names}, (ex['labels_aggregate'], ex['labels_category'])

    def gen_test():
        for ex in transformed_ds["test"]:
            yield {k: v for k, v in ex.items() if k in input_names}, (ex['labels_aggregate'], ex['labels_category'])

    train_ds = (
        tf.data.Dataset.from_generator(
            gen_train,
            ({k: tf.int32 for k in input_names}, (tf.int64, tf.int64)),
            ({k: tf.TensorShape([None]) for k in input_names},
             (tf.TensorShape([]), tf.TensorShape([]))),
        )
        if "train" in transformed_ds
        else None
    )

    if train_ds is not None:
        train_ds = train_ds.apply(
            tf.data.experimental.assert_cardinality(len(ds["train"])))

    val_ds = (
        tf.data.Dataset.from_generator(
            gen_val,
            ({k: tf.int32 for k in input_names}, (tf.int64, tf.int64)),
            ({k: tf.TensorShape([None]) for k in input_names},
             (tf.TensorShape([]), tf.TensorShape([]))),
        )
        if "valid" in transformed_ds
        else None
    )

    if val_ds is not None:
        val_ds = val_ds.apply(
            tf.data.experimental.assert_cardinality(len(ds["valid"])))

    test_ds = (
        tf.data.Dataset.from_generator(
            gen_test,
            ({k: tf.int32 for k in input_names}, (tf.int64, tf.int64)),
            ({k: tf.TensorShape([None]) for k in input_names},
             (tf.TensorShape([]), tf.TensorShape([]))),
        )
        if "test" in transformed_ds
        else None
    )

    if test_ds is not None:
        test_ds = test_ds.apply(
            tf.data.experimental.assert_cardinality(len(ds["test"])))

    label_lens = (len(ds["train"].features["labels_aggregate"].names), len(
        ds["train"].features["labels_category"].names))

    return train_ds, val_ds, test_ds, label_lens


logger = logging.getLogger(__name__)


@dataclass
class DataTrainingArguments:
    """
    Arguments pertaining to what data we are going to input our model for training and eval.

    Using `HfArgumentParser` we can turn this class
    into argparse arguments to be able to specify them on
    the command line.
    """
    path: str = field(default=None, metadata={
                            "help": "The path of the training file"})
    max_seq_length: int = field(
        default=256,
        metadata={
            "help": "The maximum total input sequence length after tokenization. Sequences longer "
            "than this will be truncated, sequences shorter will be padded."
        },
    )
    overwrite_cache: bool = field(
        default=False, metadata={"help": "Overwrite the cached training and evaluation sets"}
    )


@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune from.
    """

    model_name_or_path: str = field(
        metadata={
            "help": "Path to pretrained model or model identifier from huggingface.co/models"}
    )
    config_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained config name or path if not the same as model_name"}
    )
    tokenizer_name: Optional[str] = field(
        default=None, metadata={"help": "Pretrained tokenizer name or path if not the same as model_name"}
    )
    use_fast: bool = field(default=False, metadata={
                           "help": "Set this flag to use fast tokenization."})
    # If you want to tweak more attributes on your tokenizer, you should do it in a distinct script,
    # or just modify its tokenizer_config.json.
    cache_dir: Optional[str] = field(
        default=None,
        metadata={
            "help": "Where do you want to store the pretrained models downloaded from huggingface.co"},
    )


def main():
    # See all possible arguments in src/transformers/training_args.py
    # or by passing the --help flag to this script.
    # We now keep distinct sets of args, for a cleaner separation of concerns.
    parser = HfArgumentParser(
        (ModelArguments, DataTrainingArguments, TFTrainingArguments))
    model_args, data_args, training_args = parser.parse_args_into_dataclasses()

    if (
        os.path.exists(training_args.output_dir)
        and os.listdir(training_args.output_dir)
        and training_args.do_train
        and not training_args.overwrite_output_dir
    ):
        raise ValueError(
            f"Output directory ({training_args.output_dir}) already exists and is not empty. Use --overwrite_output_dir to overcome."
        )

    # Setup logging
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
        datefmt="%m/%d/%Y %H:%M:%S",
        level=logging.INFO,
    )
    logger.info(
        "n_replicas: %s, distributed training: %s, 16-bits training: %s",
        training_args.n_replicas,
        bool(training_args.n_replicas > 1),
        training_args.fp16,
    )
    logger.info("Training/evaluation parameters %s", training_args)

    # Load pretrained model and tokenizer
    #
    # Distributed training:
    # The .from_pretrained methods guarantee that only one local process can concurrently
    # download model & vocab.

    tokenizer = AutoTokenizer.from_pretrained(
        model_args.tokenizer_name if model_args.tokenizer_name else model_args.model_name_or_path,
        cache_dir=model_args.cache_dir,
    )

    train_dataset, eval_dataset, test_ds, label_lens = get_tfds(
        path=data_args.path,
        tokenizer=tokenizer,
        max_seq_length=data_args.max_seq_length,
    )

    config = AutoConfig.from_pretrained(
        model_args.config_name if model_args.config_name else model_args.model_name_or_path,
        finetuning_task="text-classification",
        cache_dir=model_args.cache_dir,
    )

    with training_args.strategy.scope():
        model = TFDistilBertForFakeNewsClassification.from_pretrained( #TFAutoModelForSequenceClassification
            model_args.model_name_or_path,
            from_pt=bool(".bin" in model_args.model_name_or_path),
            config=config,
            num_labels_aggregate=label_lens[0],
            num_labels_category=label_lens[1],
            cache_dir=model_args.cache_dir,
        )

    def compute_metrics(p: EvalPrediction) -> Dict:
        print(p)
        print('!!!!')
        preds = np.argmax(p.predictions, axis=1)

        return {"acc": (preds == p.label_ids).mean()}

    # Initialize our Trainer
    trainer = TFTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        compute_metrics=compute_metrics,
    )

    # Training
    if training_args.do_train:
        trainer.train()
        trainer.save_model()
        tokenizer.save_pretrained(training_args.output_dir)

    # Evaluation
    results = {}
    if training_args.do_eval:
        logger.info("*** Evaluate ***")
        result = trainer.evaluate()
        output_eval_file = os.path.join(
            training_args.output_dir, "eval_results.txt")

        with open(output_eval_file, "w") as writer:
            logger.info("***** Eval results *****")

            for key, value in result.items():
                logger.info("  %s = %s", key, value)
                writer.write("%s = %s\n" % (key, value))

            results.update(result)

    return results


if __name__ == "__main__":
    main()
