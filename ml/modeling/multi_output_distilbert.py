import tensorflow as tf
from transformers.models.distilbert.modeling_tf_distilbert import *

class TFDistilBertForFakeNewsClassification(TFDistilBertPreTrainedModel):
	def __init__(self, config, num_labels_aggregate, num_labels_category, *inputs, **kwargs):
		super().__init__(config, *inputs, **kwargs)
		# self.num_labels = config.num_labels
		print('num aggregate labels: ', num_labels_aggregate)
		print('num category labels: ', num_labels_category)

		self.distilbert = TFDistilBertMainLayer(config, name="distilbert")
		self.pre_classifier = tf.keras.layers.Dense(
			config.dim,
			kernel_initializer=get_initializer(config.initializer_range),
			activation="relu",
			name="pre_classifier",
		)
		self.classifier_aggregate = tf.keras.layers.Dense(
			num_labels_aggregate, kernel_initializer=get_initializer(config.initializer_range), name="classifier_aggregate"
		)
		self.classifier_category = tf.keras.layers.Dense(
			num_labels_category, kernel_initializer=get_initializer(config.initializer_range), name="classifier_category"
		)
		self.dropout = tf.keras.layers.Dropout(config.seq_classif_dropout)

	def compute_loss(self, labels, logits):
		if len(shape_list(logits)) == 1 or shape_list(logits)[1] == 1:
			loss_fn = tf.keras.losses.MeanSquaredError(reduction=tf.keras.losses.Reduction.NONE)
		else:
			loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(
				from_logits=True, reduction=tf.keras.losses.Reduction.NONE
			)
		return loss_fn(labels, logits)

	def call(
		self,
		input_ids=None,
		attention_mask=None,
		head_mask=None,
		inputs_embeds=None,
		output_attentions=None,
		output_hidden_states=None,
		return_dict=None,
		labels=None,
		training=False,
		**kwargs,
	):
		r"""
		labels (:obj:`tf.Tensor` of shape :obj:`(batch_size,)`, `optional`):
			Labels for computing the sequence classification/regression loss. Indices should be in ``[0, ...,
			config.num_labels - 1]``. If ``config.num_labels == 1`` a regression loss is computed (Mean-Square loss),
			If ``config.num_labels > 1`` a classification loss is computed (Cross-Entropy).
		"""
		if labels is None:
			labels = (None, None) # for when creating model with dummy inputs

		inputs = input_processing(
			func=self.call,
			config=self.config,
			input_ids=input_ids,
			attention_mask=attention_mask,
			head_mask=head_mask,
			inputs_embeds=inputs_embeds,
			output_attentions=output_attentions,
			output_hidden_states=output_hidden_states,
			return_dict=return_dict,
			labels_aggregate=labels[0],
			labels_category=labels[1],
			training=training,
			kwargs_call=kwargs,
		)
		distilbert_output = self.distilbert(
			input_ids=inputs["input_ids"],
			attention_mask=inputs["attention_mask"],
			head_mask=inputs["head_mask"],
			inputs_embeds=inputs["inputs_embeds"],
			output_attentions=inputs["output_attentions"],
			output_hidden_states=inputs["output_hidden_states"],
			return_dict=inputs["return_dict"],
			training=inputs["training"],
		)
		hidden_state = distilbert_output[0]  # (bs, seq_len, dim)
		pooled_output = hidden_state[:, 0]  # (bs, dim)
		pooled_output = self.pre_classifier(pooled_output)  # (bs, dim)
		pooled_output = self.dropout(pooled_output, training=inputs["training"])  # (bs, dim)
		logits_aggregate = self.classifier_aggregate(pooled_output)  # (bs, dim)
		logits_category = self.classifier_category(pooled_output)  # (bs, dim)

		loss = None
		if inputs["labels_aggregate"] is not None and inputs["labels_category"] is not None:
			loss_aggregate = self.compute_loss(inputs["labels_aggregate"], logits_aggregate)
			loss_category = self.compute_loss(inputs["labels_category"], logits_category)
			loss = loss_aggregate + loss_category
			print(loss)

		if not inputs["return_dict"]:
			output = (logits_aggregate, logits_category) + distilbert_output[1:]
			return ((loss,) + output) if loss is not None else output

		return TFSequenceClassifierOutput(
			loss=loss,
			logits=(logits_aggregate, logits_category),
			hidden_states=distilbert_output.hidden_states,
			attentions=distilbert_output.attentions,
		)