# focusing on build_freq function here


import nltk
from nltk.corpus import twitter_samples

#nltk.download('stopwords')
from utils import process_tweet, build_freqs
all_pos_tweets = twitter_samples.string('pos_tweets.json')
all_neg_tweets = twitter_samples.string('neg_tweets.json')

tweets = all_pos_tweets + all_neg_tweets

print(len(tweets))
