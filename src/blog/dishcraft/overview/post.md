# Overview

## 1. What Is Dishcraft?

Dishcraft is a personalized recipe application built around a simple idea: choosing what to cook should feel more like having an adaptive cooking companion than searching a static catalog. It is designed for people whose cooking preferences are personal, changing, and sometimes difficult to express through filters alone.

The product combines recipe discovery, personalized recommendations, and natural-language recipe customization. A user can find something interesting, ask for a change in ordinary language, review the result, and save the version they actually want to cook.

The product has three connected experiences:

1. Discover recipes through personalized recommendations and tags.
2. Customize a recipe by describing the desired change in natural language.
3. Find, favorite, and rate recipes as part of an ongoing cooking history.

Dishcraft helps each user find recipes that fit their tastes and circumstances, then adapt those recipes when they do not quite fit as written.

## 2. The Problem It Solves

Recipe websites are good at presenting large collections, but a large collection can create its own problem: the user still has to decide what is relevant, and the recipe may still need to be adapted.

A person may want something that is:

- compatible with ingredients they already have;
- easier or faster to prepare;
- more suitable for a dietary preference;
- less expensive;
- spicier, milder, or otherwise different in flavor; or
- similar to something they already enjoyed.

Those requests do not always fit neatly into a set of filters. They are often expressed as a sentence: “Make this vegetarian,” “Use a simpler cooking method,” or “Make it more filling without adding much time.”

Dishcraft treats those requests as part of the product experience. Discovery helps narrow the choices, while natural-language customization helps turn a promising recipe into a more appropriate one.

## 3. The Core User Experience

The main experience begins on the home page, where users see a personalized “For You” area and can browse recipes by tag. Tags provide a direct, understandable way to explore categories such as ingredients, cuisines, or other recipe characteristics.

Selecting a recipe opens a detailed view with its ingredients, equipment, steps, tags, and associated image when one is available. From there, the user can:

- favorite or unfavorite the recipe;
- record that they cooked it;
- rate the result with a thumbs-up or thumbs-down response; or
- open the editing experience and describe a change.

The product also includes a dedicated favorites view, so recipes that matter to the user are easy to find again. Cooking activity and ratings become part of the user's recipe history rather than disappearing after the current visit.

The experience is deliberately incremental. A user does not have to customize a recipe before cooking it, and they do not have to rate or favorite every recipe. Each interaction adds a small amount of useful context that can improve the user's future experience.

## 4. Personalized Recipe Recommendations

The “For You” experience uses a recommendation system to rank recipes for a particular user. Its purpose is to make the recipe catalog feel smaller and more relevant without requiring the user to search manually every time.

![Dishcraft recipe browsing screen showing personalized recommendations and recipe discovery by tag.](recipe-browsing.png)

*The product combines personalized recommendations with direct tag-based browsing.*

Recommendations are informed by recipe attributes and user preference signals. The system can represent characteristics of recipes and learn which of those characteristics a user tends to prefer. Explicit signals, such as favorites, ratings, and cooking activity, provide stronger evidence than a single page view or an isolated click.

The recommendation experience is also designed to support evaluation. Rather than treating a recommendation model as successful simply because it produces a list, Dishcraft can test how different ranking approaches behave for simulated user profiles and interaction histories. That makes it possible to ask more meaningful questions:

- Are the recommended recipes relevant to the user's preferences?
- Does the system surface a useful variety of recipes?
- Do recommendations respond appropriately when a user's interests change?
- Which signals provide the most useful evidence about preference?

Personalization can improve over time as the system's signals, ranking logic, and evaluation methods develop. It does not need to infer everything perfectly from the beginning.

The recommendation goal, baseline, ML approach, and evaluation process are described in more detail in [How Dishcraft Recommends Recipes](../recipe-recommendations/).

## 5. From Recipe Prompt to Saved Recipe

Recipe customization is initiated with a natural-language prompt. Instead of requiring the user to edit every ingredient and instruction manually, Dishcraft lets them describe the outcome they want.

![Dishcraft recipe editing screen showing a request to turn skirt steak street tacos into a rice bowl.](edit-request-tacos.png)

*A user can describe the desired change without manually editing every recipe field.*

The system plans the requested change, generates revised recipe content, and validates the result before showing it as a draft. This gives the user a reviewable version rather than immediately replacing the saved recipe.

![Dishcraft recipe result showing the generated skirt steak rice bowl.](edit-result.png)

*The generated result is presented for review before the user decides whether to save it.*

Each generated revision is stored as a new draft with a complete snapshot of its recipe content. When a user asks for another change, the next draft points back to the previous one. This creates a lineage: a record of how the recipe evolved from its source to the version the user ultimately selected.

When the user selects “Save Recipe,” the current draft is normalized into a durable recipe with its provenance preserved. A saved recipe can also become the starting point for future customization without changing the saved version.

The full draft, lineage, and normalization workflow is described in the [recipe draft workflow](../recipe-draft-workflow/).

## 6. The Product and Engineering Decisions Behind It

Several design decisions shape the product experience.

Dishcraft separates experimentation from durable data. A generated revision is a draft, not an immediate replacement for a saved recipe. Users control what they keep, while the system retains a reliable history of how a recipe changed.

The AI workflow is structured into planning, generation, and schema validation. Each stage has a distinct role: rejecting unsuitable requests, inspecting the intended change, and checking that the result is a usable recipe rather than merely plausible text.

Personalization also needs evidence and evaluation. Favorites, ratings, cooking activity, recipe attributes, and simulated interactions help measure whether recommendations are useful instead of assuming that a ranked list is automatically a good one.

The frontend and backend share contracts for their requests and responses. This keeps the user interface and API aligned as features evolve, catches mismatches at the boundary, and makes product changes easier to implement.

The full system structure and deployment model are described in the [Dishcraft architecture overview](../architecture/).
