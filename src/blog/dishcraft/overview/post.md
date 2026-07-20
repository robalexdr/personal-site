# Dishcraft: A Product Overview

## 1. What Is Dishcraft?

Dishcraft is a personalized recipe application built around a simple idea: choosing what to cook should feel more like having an adaptive cooking companion than searching a static catalog. It is designed for people whose cooking preferences are personal, changing, and sometimes difficult to express through filters alone.

The product combines recipe discovery, personalized recommendations, and natural-language recipe customization. A user can find something interesting, ask for a change in ordinary language, review the result, and save the version they actually want to cook.

The product has three connected experiences:

1. Discover recipes through personalized recommendations and tags.
2. Customize a recipe by describing the desired change in natural language.
3. Find, favorite, and rate recipes as part of an ongoing cooking history.

The goal is not simply to provide more recipes. It is to help each user find recipes that fit their tastes and circumstances, then make those recipes more useful when they do not quite fit as written.

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

Recommendations are informed by recipe attributes and user preference signals. The system can represent characteristics of recipes and learn which of those characteristics a user tends to prefer. Explicit signals, such as favorites, ratings, and cooking activity, provide stronger evidence than a single page view or an isolated click.

The recommendation experience is also designed to support evaluation. Rather than treating a recommendation model as successful simply because it produces a list, Dishcraft can test how different ranking approaches behave for simulated user profiles and interaction histories. That makes it possible to ask more meaningful questions:

- Are the recommended recipes relevant to the user's preferences?
- Does the system surface a useful variety of recipes?
- Do recommendations respond appropriately when a user's interests change?
- Which signals provide the most useful evidence about preference?

This turns personalization into an iterative product capability. The system is not expected to infer everything perfectly from the beginning; it is designed to improve as its signals, ranking logic, and evaluation methods develop.

The recommendation goal, baseline, ML approach, and evaluation process are described in more detail in [How Dishcraft Recommends Recipes](../recipe-recommendations/).

## 5. LLM-Powered Recipe Customization

Recipe customization is initiated with a natural-language prompt. Instead of requiring the user to edit every ingredient and instruction manually, Dishcraft lets them describe the outcome they want.

For example, a user might ask to:

- replace an ingredient;
- make a recipe vegetarian;
- use a different piece of equipment;
- reduce preparation complexity; or
- change the flavor profile.

The generation workflow has two important stages. First, a planning step determines whether the request is appropriate and what changes it calls for. Then a generation step produces revised recipe content. The result is validated against a structured recipe-content schema before it is shown as a draft.

This separation provides more control than sending the original recipe and user prompt directly to a single generation call. It creates a place to reject unsupported requests, make the intended change explicit, and verify that the generated result still has the expected recipe structure.

The user sees the result as a draft, not as an immediate replacement for the original recipe. That distinction gives them a chance to review the name, ingredients, equipment, steps, and tags before deciding whether the result is worth keeping.

The draft model behind this workflow is described in more detail in the [recipe draft workflow](../recipe-draft-workflow/).

## 6. From Draft to Saved Recipe

The draft experience is the bridge between experimentation and durable product data.

Each generated revision is stored as a new draft with a complete snapshot of its recipe content. When a user asks for another change, the next draft points back to the previous one. This creates a lineage: a record of how the recipe evolved from its source to the version the user ultimately selected.

A draft can begin from an existing recipe, continue from another draft, or start as an original recipe. Drafts that begin from an existing recipe retain that origin as they move through the editing sequence. Drafts created from scratch have no source recipe, but they still form their own sequence through the same lineage mechanism.

When the user selects “Save Recipe,” the current draft is normalized into a durable recipe. The flexible JSON content is converted into structured recipe records for ingredients, units, equipment, and tags. The new recipe also retains provenance: it records which draft produced it and whether the draft was original or derived from another recipe.

A saved recipe can also become the starting point for future customization. A later edit creates a new draft lineage derived from that recipe, leaving the saved recipe unchanged while giving the user another path to explore.

This boundary keeps the main recipe catalog clean. Intermediate experiments remain available as draft history, while only the version the user chooses becomes a normal recipe that can be browsed, favorited, cooked, rated, and recommended.

## 7. The Product and Engineering Decisions Behind It

Several design decisions shape the product experience.

First, Dishcraft separates experimentation from durable data. A generated revision is a draft, not an immediate replacement for a saved recipe. This gives users control over what they keep and gives the system a reliable history of how a recipe changed.

Second, the AI workflow is intentionally structured. Planning, generation, and schema validation each have a distinct role. That makes it possible to reject unsuitable requests, inspect the intended change, and ensure that the result is still a usable recipe rather than merely plausible text.

Third, personalization is treated as a system that needs evidence and evaluation. Favorites, ratings, cooking activity, recipe attributes, and simulated interactions provide ways to measure whether recommendations are useful instead of assuming that a ranked list is automatically a good one.

Finally, the frontend and backend share contracts for their requests and responses. This keeps the user interface and API aligned as features evolve, catches mismatches at the boundary, and makes product changes easier to implement with confidence.

The full system structure and deployment model are described in the [Dishcraft architecture overview](../architecture/).
