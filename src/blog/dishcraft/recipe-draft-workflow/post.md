# From Draft to Recipe: How Dishcraft Tracks Lineage

Dishcraft treats recipe creation as a two-stage process. A user first works with a flexible draft, then chooses whether to turn that draft into a durable, normalized recipe.

That separation matters. Drafts capture the creative process—the source recipe, the user's prompt or edits, and the successive versions of the content. Normalized recipes are the structured records that the rest of the product can search, display, recommend, favorite, and mark as cooked.

## The short version

The current workflow looks like this:

![Diagram showing the recipe draft process from an original idea or recipe through a draft lineage and normalization into a durable recipe.](draft-process.png)

*A draft lineage preserves the editing history until one draft is normalized into a durable recipe.*

Every draft stores a complete snapshot of the recipe content at that point in the process. The drafts are connected to one another, but the normalized recipe is a separate database record created only when the user saves the result.

## Two representations of a recipe

### Recipe drafts: flexible working documents

A `RecipeDraft` stores recipe content in a JSON document. That content contains the presentation-level form used by the draft experience:

- the recipe name;
- ingredients with amounts, units, and item names;
- equipment with counts and item names;
- ordered cooking steps; and
- tags.

Drafts also carry the identity of the user who created them, an optional prompt, and the fields that describe their place in a lineage.

The current draft record is intentionally lean, but that also defines its limits. It does not have a separate `method` field distinguishing prompt generation from direct editing, nor does it persist model metadata, raw model output, or an input snapshot. In practice, a non-null `prompt` identifies a prompt-generated revision; a null prompt is used for direct content submission.

The draft API validates this JSON content before it is stored. A generated draft must pass the same recipe-content schema as an editor-submitted draft, which keeps both paths compatible with the later normalization step.

### Normalized recipes: durable product records

A normalized `Recipe` stores the same idea in a relational form. Ingredients point to reusable grocery and unit records. Equipment points to reusable equipment records. Tags are connected to shared tag records, while the recipe itself stores its ordered steps, name, slug, and provenance.

This is the representation used by the rest of the application. It supports recipe browsing and detail pages, favorites, cooking history, recommendations, visibility rules, and other product features.

## The workflow

### 1. A draft begins from a source

The current API supports three source types for draft creation:

1. `original` — start from scratch;
2. `recipe` — start from an existing recipe; or
3. `draft` — continue from an existing draft.

Starting from a recipe creates a new lineage. Starting from an existing draft continues that draft's lineage. Starting from scratch creates a new lineage with no source recipe.

The source is checked against the current user before the new draft is created. A user can continue only from their own draft, and a source recipe must be visible to that user—either published or owned by them.

### 2. Content is generated or edited

There are two API operations for producing draft content:

- `POST /api/drafts/generate` accepts a recipe or draft source and a prompt. The service turns the source into recipe content, asks the planning and generation pipeline to produce a revision, validates the result, and persists it as a new draft.
- `POST /api/drafts/edit` accepts a source and complete recipe content. It validates and persists that content as a new draft without calling the language model.

Both operations use the same persistence path after their content has been prepared. The result is always a new row; an earlier draft is not overwritten.

In the current product UI, an “Apply Edit” action is implemented through prompt generation: the user describes the change and the language-model workflow produces the next draft. The lower-level edit endpoint also exists for directly submitting complete content.

### 3. The user continues the chain

When the source is another draft, the new draft copies the source draft's lineage and source recipe information. Its `sourceDraftId` points to the draft it was based on.

For example:

```text
Draft A
  lineageId: L1
  sourceRecipeId: null
  sourceDraftId: null

Draft B
  lineageId: L1
  sourceRecipeId: null
  sourceDraftId: Draft A
```

The same pattern applies to a recipe-derived chain, except that `sourceRecipeId` remains set to the original recipe:

```text
Recipe R
    |
    v
Draft A
  lineageId: L2
  sourceRecipeId: R
  sourceDraftId: null
    |
    v
Draft B
  lineageId: L2
  sourceRecipeId: R
  sourceDraftId: Draft A
```

## How lineages work

A lineage is the identity of one continuous draft sequence. It is not the identity of a recipe, a user, or a single prompt. It answers the question: “Which drafts belong to this editing history?”

The implementation uses three fields together:

| Field | Meaning |
| --- | --- |
| `lineageId` | Groups every draft in one sequence. |
| `sourceDraftId` | Points to the immediate previous draft. |
| `sourceRecipeId` | Identifies the recipe from which the sequence ultimately originated, when there is one. |

These fields separate two related ideas:

- `lineageId` tells us which history a draft belongs to.
- `sourceDraftId` tells us the exact previous version.

That makes the history both easy to group and easy to traverse. A query can find every draft in a lineage, while the parent pointer preserves the exact sequence that led to the selected draft.

### Original lineages

An original lineage starts without a recipe:

```text
Draft 1 -> Draft 2 -> Draft 3
```

Every draft has the same `lineageId`, each later draft points to the previous draft, and `sourceRecipeId` remains `null`. If Draft 3 is normalized, the resulting recipe is marked as created from an original draft path.

### Recipe-derived lineages

A derived lineage starts from an existing recipe:

```text
Recipe A -> Draft 1 -> Draft 2 -> Recipe B
```

`sourceRecipeId` is set to Recipe A on every draft in the chain, while `sourceDraftId` records the local step-by-step history. If Draft 2 is normalized, the resulting Recipe B is marked as derived and keeps a direct reference to Draft 2 through `createdFromRecipeDraftId`.

### The current chain constraint

`sourceDraftId` is unique in the database. In practical terms, a draft can have at most one direct child, so the persisted model is a single chain rather than a branching tree. The application creates new rows as the user advances through the current chain, but it does not currently model multiple competing children from the same parent.

## Normalization: the boundary between working state and product state

Normalization is exposed as:

```text
POST /api/drafts/:draftId
```

The operation runs in a database transaction and performs the following work:

1. It loads the draft belonging to the authenticated user.
2. It checks whether that draft has already produced a recipe.
3. It creates a relational recipe from the draft's JSON content.
4. It connects or creates the referenced grocery, unit, equipment, and tag records.
5. It records the draft as the recipe's `createdFromRecipeDraftId`.
6. It records the authenticated user as `createdByUserId`.
7. It marks the recipe as unpublished by default.
8. It classifies the recipe as `original` or `derived` based on whether `sourceRecipeId` is null.
9. It returns the full recipe through the normal recipe read path.

The direct draft-to-recipe link is unique. That gives normalization an idempotent behavior: if the same draft is submitted again after it has already been normalized, the existing recipe is returned instead of creating another one.

The normalized recipe receives a slug based on its name plus a short random suffix. This avoids collisions while keeping the URL readable.

## User-specific recipe state

Recipe content and user interaction state are stored separately. `UserRecipeState` is keyed by the pair of user and recipe, so the same recipe can have different interaction data for different users.

The current state includes:

- `isFavorited`;
- `timesCooked`;
- `rating`; and
- `lastCookedAt`.

Favorite and unfavorite operations upsert this row. Recipe reads merge the matching row into the response and default to `isFavorited: false`, zero cooks, and no rating when no row exists. Cooking a recipe also upserts the same state record, incrementing the cook count and recording the rating and timestamp.

The current implementation does not include hidden-recipe state. Visibility is instead controlled by whether a recipe is published or owned by the requesting user. A newly normalized recipe is private to its creator until it is published.

## Current API surface

The draft workflow is intentionally small:

| Action | Route | Result |
| --- | --- | --- |
| Edit content directly | `POST /api/drafts/edit` | Creates a new draft from an original, recipe, or draft source. |
| Generate a revision | `POST /api/drafts/generate` | Runs the planning/generation pipeline and creates a new draft. |
| Normalize a draft | `POST /api/drafts/:draftId` | Creates or returns the durable recipe produced from that draft. |

All three routes require authentication. There is currently no public `GET` draft route; the draft read helper is used internally when a later operation needs to load a user's draft. The web draft page receives the draft through navigation state, which means opening a draft directly or refreshing that page is not currently a complete read flow.

## Why this separation is useful

This design gives Dishcraft a durable record of the creative path without forcing every intermediate experiment into the main recipe catalog.

It preserves useful provenance:

- which recipe or draft started the process;
- which draft was the immediate predecessor;
- which lineage the draft belongs to; and
- exactly which draft became the normalized recipe.

At the same time, the normalized recipe remains clean and operational. Once a draft crosses the normalization boundary, it can participate in the application's relational features without losing the history that explains where it came from.

The result is a simple mental model: drafts are versions in a user's working history, lineages are the threads that connect those versions, and normalization is the explicit moment when one version becomes a recipe.
