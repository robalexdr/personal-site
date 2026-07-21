# Recipe Recommendation

Dishcraft's recommendation system is designed around a practical product goal: help each user see a short list of recipes that better fits their tastes, instead of asking them to search the entire catalog every time they want to cook.

The recommender is also an experiment in how to build personalization responsibly. It starts with a transparent baseline, adds a small machine-learning model, and evaluates both approaches against simulated users whose preferences are known to the evaluator but hidden from the models.

## 1. The Recommendation Goal

The system represents recipes using a small set of meaningful attributes:

- protein, such as chicken, beef, fish, or tofu;
- carbohydrate, such as rice, pasta, potatoes, or wraps; and
- flavor, such as spicy, creamy, sweet, or savory.

Each user has preferences over those attributes. Some users have broad positive preferences, some care strongly about one dimension, and some have a mixture of likes and dislikes.

The recommender's job is to infer those preferences from observable behavior and use them to rank recipes that have not already been represented by normalized copies. The goal is not to predict a single correct recipe. It is to produce a useful ordering of candidates while leaving room for variety and discovery.

## 2. Turning Interactions into Preference Signals

The system learns from actions that can reasonably indicate interest. The current interaction signal combines:

- a favorite: a small positive signal;
- a thumbs-up rating: a stronger positive signal;
- a thumbs-down rating: a negative signal;
- normalizing a recipe into an independent saved recipe: a strong positive signal; and
- cooking a recipe repeatedly: an increasingly strong positive signal.

The first cook is treated as exposure rather than proof of preference. Additional cooks carry more evidence, with the signal increasing quadratically and capped so that one extremely repeated recipe cannot overwhelm the entire profile.

These weights are intentionally explicit. They are starting assumptions that can be inspected and tuned, not claims that every user behaves according to one universal formula.

## 3. The Transparent Baseline

The baseline is a rules-based profile built from weighted averages.

For each interaction, the system calculates its signal and applies that signal to the recipe's protein, carb, and flavor attributes. It then averages the evidence observed for each attribute. The result is a profile such as:

```text
chicken  +3.2
fish     -2.1
rice     +1.4
spicy    +0.8
sweet    -1.7
```

To rank a recipe, the system looks up the profile weight for each of the recipe's attributes and averages the values. Recipes with higher scores appear earlier in the list.

This baseline is intentionally simple. Its value is that a recommendation can be explained in ordinary language: the user has repeatedly responded positively to recipes with particular attributes, so recipes containing those attributes received higher scores.

It also establishes a useful standard for improvement. A more sophisticated model should earn its complexity by producing better rankings, not merely by being harder to inspect.

## 4. The Machine-Learning Method

The first machine-learning approach is a separate ridge-regression model for each user.

Recipes are converted into a one-hot feature matrix. Each distinct value becomes a numeric feature, such as `protein_chicken`, `carb_rice`, or `flavor_spicy`. A user's observed interactions become training examples, and the interaction signals become the numeric targets the model learns to predict.

The model learns a coefficient for each recipe attribute. Positive coefficients indicate evidence that an attribute is associated with stronger interaction signals for that user; negative coefficients indicate the opposite. Ridge regularization keeps those coefficients from becoming too extreme when a user has only a small number of observations.

The learned coefficients are translated back into the same profile shape used by the ranking code. This is a deliberate design choice: the machine-learning model improves how the profile is inferred, while both the baseline and ML strategy continue to use the same candidate representation and ranking interface.

The result is a small, content-based model rather than a large black-box recommender. It does not yet use collaborative filtering, embeddings, or cross-user similarity. That keeps the experiment appropriate for the current dataset and makes its behavior easier to inspect.

## 5. How the Evaluations Work

The evaluation dataset contains simulated users with hidden affinity profiles. A hidden affinity can be a like, neutral preference, or dislike for each recipe attribute. Those hidden profiles generate realistic-looking interactions, including favorites, ratings, cooking frequency, and normalization events.

The hidden preferences are used to generate the data and to score recommendations during evaluation. They are never provided to either recommender as training input. That separation is essential: the model must infer preferences from behavior, just as it would in the product.

The interaction simulation turns hidden compatibility into observable behavior. It ranks recipes for each simulated user, selects representative rank bands, and then uses compatibility-dependent probabilities to decide whether each selected recipe is normalized, favorited, cooked repeatedly, and rated up or down.

The dataset-generation seed controls the random draws used during that process. For every user, it determines the tie-breaking order for recipes with equal compatibility. That ordering affects which recipes fall into the selected rank bands, currently ranks 21–30, 51–60, and 71–80. For those selected recipes, the same seeded random generator determines the repeat-cook count and the outcomes of the normalization, favorite, and rating decisions.

The seed does not change the probability rules themselves. Compatibility still determines the probability of each outcome; the seed determines which side of each probability draw the simulation lands on. The same seed therefore recreates the same interaction dataset, while a different seed produces a different but comparable history of behavior under the same assumptions. The hidden user profiles and recipe definitions are generated separately, so changing this seed primarily changes interaction outcomes and tie-breaking rather than the underlying preferences or catalog.

![Dishcraft recommendation evaluation workflow showing simulated interactions, per-user training and held-out partitions, model fitting, candidate ranking, and hidden-compatibility metrics.](rec-evals.png)

*The evaluation workflow separates observed training signals from the hidden compatibility scores used only for scoring.*

For each evaluation run:

1. User interactions are split independently into training and held-out data.
2. The rules-based and ridge profiles are fitted using only the training interactions.
3. Candidate recipes used in the user's training history, along with normalized copies, are excluded.
4. Each model ranks the remaining recipes.
5. The ranking is compared with the user's hidden compatibility scores.

The primary metric is `NDCG@5`, which measures how closely the model's top-five ordering matches the ideal hidden-preference ordering. A second metric, `ground_truth@5`, reports the average hidden compatibility of the model's five recommendations. NDCG evaluates ordering quality, while the compatibility score is easier to interpret as an average quality signal.

There are two related uses of seeds in the evaluation workflow. The dataset seed controls the simulated interaction history described above. The evaluator seed separately controls how each user's observed interactions are shuffled into training and held-out sets. This means the same dataset can be evaluated with different reproducible splits, or the entire dataset can be regenerated with a different interaction seed.

The multi-run evaluation script changes the dataset seed for each run, regenerates the interaction data, resets the development database, and evaluates the resulting dataset. Repeating the experiment this way tests whether the model comparison is stable across alternate simulated behavior, rather than depending on one particular set of random outcomes. Within each run, the same seed is also passed to the evaluator so the train/test split is deterministic for that generated dataset.

## 6. What the Results Mean

In the current recorded experiment, the ridge model outperformed the rules-based baseline across ten runs with 60 simulated users. Its mean NDCG@5 was higher, and the hidden compatibility of its top-five recommendations was also higher.

The aggregate results were:

| Strategy | Users | Runs | Mean NDCG@5 | NDCG@5 standard deviation | Mean ground truth@5 | Ground truth@5 standard deviation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Rules baseline | 60 | 10 | 0.759 | 0.018 | 0.265 | 0.021 |
| Ridge model | 60 | 10 | 0.806 | 0.014 | 0.336 | 0.014 |

Ridge improved mean NDCG@5 by `0.047` and mean top-five ground-truth compatibility by `0.071`. Its smaller standard deviations also indicate less variation across these ten runs, although this is still an evaluation on a controlled synthetic dataset.

That result supports using ridge as the preferred experimental strategy while keeping the rules-based approach as a transparent reference point. It does not prove that ridge will be better for every future dataset or that the system is ready for unrestricted production use. The evaluation is based on a controlled synthetic world with three recipe dimensions and simulated behavior.

The experiment shows that the ML method can recover more of the simulated preference signal under the current assumptions. The next question is whether those assumptions remain useful when the product has richer recipe attributes, more varied user behavior, and real feedback.

### Reproducing the evaluation

The repository includes a root-level script that regenerates the synthetic dataset, resets and reseeds the development database, runs the rules-versus-ridge evaluation, and prints both per-run and aggregate results. From the repository root:

```bash
bash scripts/evaluate-recommendations.sh --seed 42 --runs 10
```

The script uses dataset seeds 42 through 51 for the ten runs. It requires the local API and analytics database configuration to be available, and it is intended for the development database because each run resets and reseeds it.

## 7. From Offline Experiment to Product Feature

The production-shaped workflow keeps recommendation computation separate from the user-facing API. An analytics worker periodically identifies users whose recommendations need refreshing, computes a recommendation run, stores the ranked results, and publishes the successful run. The API then reads the most recent successful recommendations for the web application to display.

This design keeps model computation out of the request path and gives each recommendation run a durable status and history. It also leaves room to compare strategies, inspect failures, and change the refresh schedule without changing the web experience.

The current system follows a staged path: establish a measurable offline model, compare it with a transparent baseline, and then decide whether it belongs in the product's recurring recommendation workflow.
