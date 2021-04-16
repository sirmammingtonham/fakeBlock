import json
import tensorflow as tf
from tensorflowjs.converters import convert_tf_saved_model
from modeling.multi_output_distilbert import TFDistilBertForFakeNewsClassification # type: ignore


def main():
    # load huggingface model
    model = TFDistilBertForFakeNewsClassification.from_pretrained(
        './model', num_labels_aggregate=3, num_labels_category=8)

    # define tensorflow function for faster inference
    callable = tf.function(model.call)
    max_sequence_length = 512
    concrete_function = callable.get_concrete_function([tf.TensorSpec([None, max_sequence_length], tf.int32, name="input_ids"), tf.TensorSpec([
                                                       None, max_sequence_length], tf.int32, name="attention_mask")])
    print(concrete_function)

    # save huggingface model as tf saved_model
    tf.saved_model.save(model, 'distilbert_nela', signatures=concrete_function)

    # convert saved_model to tensorflow.js web format
    convert_tf_saved_model('distilbert_nela', 'distilbert_nela_js')

    # convert tokenizer vocab
    vocab = []
    with open('model/vocab.txt', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.rstrip()
            # idk why but the tokenizer library we're using does it the opposite of huggingface
            if line.startswith('##'):
                vocab.append(line.strip('##'))
            elif line.startswith('['):
                vocab.append(line)
            else:
                vocab.append(u'\u2581' + line)

    # jsonString = json.dumps(vocab)
    # print(jsonString[:50])
    with open('../src/detection/tokenizer/vocab.json', 'w+', encoding='utf-8') as f:
        json.dump(vocab, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
