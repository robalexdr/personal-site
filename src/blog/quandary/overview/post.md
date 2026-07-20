# Overview

## What is Quandary?

Quandary is a learning system being built around a simple premise: durable understanding is not the same thing as recognizing an answer, recalling an isolated fact, or receiving a fluent explanation from an AI.

Most learning tools specialize in one part of the process. Flashcard systems help schedule repeated recall. Note-taking tools help capture and organize ideas. AI assistants help explain material and answer questions. Document-chat systems help search and discuss a source. Each is useful, but the learner is still left to assemble these pieces into a coherent process for developing, testing, and refining understanding.

Quandary is an attempt to bring those pieces together without turning learning into a fully automated judgment system. It treats the learner's own notes as the center of the system, uses external sources as supporting evidence, and employs AI primarily as an active dialogue partner. The goal is not for the AI to declare whether the learner has mastered a topic. The goal is to create better opportunities for the learner to explain, reconstruct, compare, question, and revise what they know.

## The Problem Quandary Is Trying to Solve

Many learning tools optimize for convenience while weakening the effort that makes learning effective.

A summarizer can reduce a chapter to a few paragraphs, but reading the summary does not show whether the learner can reconstruct the ideas independently. A chatbot can answer follow-up questions, but a smooth conversation can create the impression of understanding even when the learner is mostly recognizing what the model says. A flashcard system can produce excellent retention for discrete facts, but many subjects do not naturally decompose into isolated prompts and answers.

Real understanding often involves larger structures:

- explaining an idea in one's own words
- connecting it to related concepts
- identifying assumptions and exceptions
- comparing competing explanations
- applying it to unfamiliar cases
- recognizing uncertainty
- revising earlier beliefs

These activities are difficult to represent as a stack of atomic cards. They are also difficult to evaluate automatically. A system that compresses them into a single mastery score risks creating false precision.

Quandary instead focuses on supporting the process through which the learner forms and tests judgments about their own understanding.

## From Atomic Recall to Understanding in Context

Atomic recall remains valuable. Names, definitions, formulas, vocabulary, and other discrete details often benefit from traditional spaced repetition. Quandary is not based on rejecting that model.

The limitation appears when atomic recall becomes the default representation for all learning.

A learner may remember the definition of a concept without being able to explain why it matters. They may memorize the steps of an argument without seeing where the argument could fail. They may recognize the correct answer in a prompt while being unable to generate it from a broader question.

Quandary therefore treats recall as something that can happen at several levels:

- recalling a fact
- reconstructing an explanation
- outlining an argument
- comparing alternatives
- solving a problem
- defending a claim
- identifying gaps
- synthesizing material across sources

The system should support short, precise recall where appropriate, but it should also support longer and less structured forms of retrieval.

## The Core Idea: AI-Guided Active Recall

The central interaction in Quandary is not passive question answering. It is a structured learning dialogue.

The learner begins with a topic, note, source, or collection of materials. Instead of immediately supplying an explanation, the AI can ask the learner to reconstruct the idea from memory. It can then respond to the learner's answer by raising missing points, identifying ambiguities, asking for examples, challenging unsupported claims, or introducing relevant counterarguments.

Different sessions might take different forms:

- an oral examination
- a Socratic dialogue
- a Feynman-style explanation exercise
- a comparison between two theories
- a technical design review
- a problem-solving session
- an adversarial critique
- a synthesis across several documents

The AI is useful here because it can make the interaction responsive. It does not need to follow a fixed sequence of cards. It can adapt its next question to what the learner just said.

That flexibility is valuable, but it also creates risk. A model may ask shallow questions, overstate confidence, introduce false information, or interpret a strong-sounding answer as evidence of understanding. Quandary therefore should not treat the model as an unquestionable evaluator. Its primary role is to create productive intellectual friction.

## Why the Learner Remains the Judge

Many AI learning products are attracted to the idea of automatically estimating mastery. In principle, a system could analyze the learner's responses, assign scores, and schedule future reviews without requiring much manual input.

That may be useful in limited settings, but it should not be the foundation of Quandary.

Understanding is difficult to infer from a single response. A learner may give a polished answer they memorized without grasping the underlying structure. They may understand a topic well but explain it poorly. A model may reward confidence, length, or familiar phrasing rather than genuine comprehension.

Quandary should therefore preserve explicit user judgment. The learner might rate:

- whether a question exposed a real gap
- whether an explanation was useful
- whether the topic felt easy or difficult
- whether a response changed their understanding
- whether a future review is needed
- whether a generated artifact should be retained

AI-generated assessments can still exist, but they should be treated as advice rather than final authority. The system can say, in effect, “Here are the weaknesses I noticed,” rather than “You have achieved 82 percent mastery.”

## Notes as the Primary Source of Truth

Quandary should treat the learner's own notes as the primary expression of what they care about.

External sources are important, but they do not automatically reflect the learner's goals. A textbook may contain more detail than the learner needs. An article may emphasize a different interpretation. A reference work may be accurate but poorly aligned with the learner's current project.

The learner's notes record a more personal structure:

- what they considered important;
- what they found confusing;
- which distinctions mattered;
- which examples helped;
- what they currently believe;
- and what remains unresolved.

That makes notes a natural anchor for future dialogue.

Quandary can still connect those notes to textbooks, papers, documentation, videos, or web sources. The important distinction is that outside material supports and challenges the learner's knowledge base rather than replacing it with a black-box answer stream.

The system should also make source boundaries visible. A learner should be able to distinguish among:

- their own prior writing
- quoted or paraphrased source material
- AI-generated suggestions
- later revisions

## Learning Artifacts, Not Just Chat Histories

Most AI conversations are transient. Even when they are saved, a chat log is usually a poor long-term knowledge artifact. Useful insights become buried among prompts, clarifications, and discarded directions.

Quandary should convert productive sessions into durable outputs.

A session might produce:

- a revised note
- a clearer explanation
- a list of unresolved questions
- a concept map
- a set of claims with supporting sources
- a comparison table
- a summary of misconceptions
- a future review prompt
- a record of how the learner's view changed

These artifacts should remain readable and useful without the AI interface. A local collection of Markdown files is an obvious starting point because it is portable, inspectable, versionable, and compatible with tools such as Obsidian.

The distinction matters. Quandary is not only a place where learning conversations happen. It is a system for turning those conversations into a growing body of personal knowledge.

## A Typical Quandary Workflow

A basic workflow might look like this:

1. The learner selects a note, topic, or source
2. Quandary asks what kind of session the learner wants
3. The learner attempts to recall or explain the material without seeing the answer
4. The AI asks targeted follow-up questions
5. The learner identifies gaps, uncertainties, or weak connections
6. Relevant source material is introduced when needed
7. The learner revises an explanation or creates a new artifact
8. The session ends with a reflection and an optional future review
9. The artifact and session metadata are saved locally

The workflow should be flexible rather than rigid. Some sessions may last two minutes and produce a single question. Others may become extended investigations across multiple sources.

## Technical Direction

A plausible technical direction for Quandary is a local-first system with structured documents and pluggable AI workflows.

### Local-first storage

The learner's notes, sources, session records, and generated artifacts should be stored in formats that remain accessible outside the application. Markdown and JSON are natural candidates.

Local-first storage provides several advantages:

- ownership and portability
- offline access
- compatibility with existing editors
- straightforward backup and version control
- reduced dependence on a single hosted service

Cloud synchronization could be added later, but it should not be required for the core system.

### Structured documents

Plain text alone may not be enough. Quandary will likely need structured metadata for topics, sources, relationships, review history, confidence, and unresolved questions.

This structure could be stored in front matter, sidecar files, or an internal database that points back to human-readable documents.

### Retrieval and source attribution

The system needs to locate relevant passages from both the learner's notes and external sources. Retrieval should be transparent enough that the learner can inspect where an answer or challenge came from.

Source attribution is especially important when the AI introduces information that was not present in the learner's notes.

### Session state

A productive dialogue depends on more than retrieving a few nearby chunks. The system may need to track:

- the current learning objective
- what the learner has already attempted
- which gaps have appeared
- which claims have been challenged
- what evidence has been introduced
- what artifact is being developed

This suggests a structured session model rather than a simple stateless chat interface.

### Configurable workflows

Different forms of learning require different interaction policies. Quandary should eventually allow workflows to define:

- the role of the AI
- the order of stages
- what sources are available
- what kinds of questions are preferred
- what artifacts should be created
- how the session ends
- what feedback is collected

This could begin as a small set of built-in modes and later develop into a more general workflow framework.

### Model portability

The system should avoid assuming that one model provider will always be used. Different tasks may benefit from different models, and some users may prefer local inference.

A model abstraction layer could make it possible to switch among hosted and local models while preserving the same underlying notes and workflows.

## Representing Knowledge and Learning State

One of the central design questions is how much structure Quandary should impose on knowledge.

At one extreme, the system could treat every document as unstructured text and rely entirely on retrieval. This would be simple but might make it difficult to track learning over time.

At the other extreme, the system could require every claim, question, and relationship to be represented explicitly. This could support sophisticated behavior but create too much overhead for the learner.

A middle path may be more practical. Documents remain primary, while optional structures are layered on top.

Useful entities might include:

- topics
- claims
- questions
- sources
- examples
- misconceptions
- dependencies
- confidence judgments
- review events
- session artifacts

The system should create structure when it clearly adds value, not merely because it is technically possible.

## Scheduling Without Reducing Learning to a Score

Spaced repetition demonstrates that review timing matters. Quandary should incorporate that insight without assuming that every learning object can be reduced to a card with a single difficulty rating.

Review scheduling could consider several signals:

- how long it has been since the topic was examined
- how difficult the learner found the session
- whether important gaps were exposed
- whether the learner wants another review
- whether the topic is foundational to other work
- whether the learner's notes have changed
- whether a future project depends on the material

Some reviews may be automatically suggested. Others may be manually scheduled. The learner should be able to override the system easily.

The long-term goal is not to discover one universal scheduling algorithm. It is to support several policies appropriate to different kinds of knowledge.

## Configurable Learning Workflows

Quandary becomes more useful when it can support multiple modes of intellectual work.

### Oral examination

The AI asks broad questions, follows up on weak points, and avoids revealing answers too quickly.

### Feynman explanation

The learner explains a concept in simple language. The AI identifies vague phrases, hidden assumptions, and places where the explanation depends on unexplained terminology.

### Socratic dialogue

The AI focuses on assumptions, implications, contradictions, and counterexamples.

### Synthesis

The learner combines ideas from several notes or sources into a larger framework.

### Adversarial review

The AI challenges a design, argument, or interpretation as strongly as possible.

### Problem solving

The system guides the learner through a problem while trying to preserve productive struggle.

### Reflection and revision

The learner compares their current understanding with earlier notes and records how their view has changed.

These modes could share common components while differing in their prompts, stages, tools, and outputs.

## How Quandary Compares to Existing Tools

### Anki

Anki is highly effective for scheduled recall of discrete prompts and answers. Quandary would operate at a broader level, especially for explanations, arguments, comparisons, and open-ended dialogue.

The two systems could be complementary. Quandary might even generate or export atomic cards when a topic naturally contains facts worth memorizing.

### SuperMemo

SuperMemo is the closest conceptual predecessor because it combines spaced repetition with a larger philosophy of incremental learning and working through complex material.

Quandary extends that direction through adaptive AI dialogue, richer user-authored notes, and configurable learning workflows. It also places more emphasis on the learner's judgment rather than attempting to automate the full learning process.

### Obsidian

Obsidian is a strong environment for local, linked, durable notes. It provides the kind of artifact ownership that Quandary should preserve.

Quandary differs by focusing specifically on active recall, guided dialogue, review, and learning-state tracking. It could initially exist as an Obsidian-integrated tool rather than trying to replace the note environment itself.

### NotebookLM and document-chat tools

NotebookLM and similar systems are useful for asking questions about a collection of sources. They are generally optimized for retrieving and explaining information from those sources.

Quandary would place more emphasis on eliciting the learner's understanding before providing answers. Its primary question is not only, “What do these documents say?” but also, “What can the learner reconstruct, where are the gaps, and what should change in their notes?”

### General-purpose AI assistants

A general-purpose assistant can already perform many individual Quandary-like tasks when prompted carefully. The limitation is that the learner must repeatedly define the workflow, supply context, preserve outputs, and track progress manually.

Quandary would make those learning patterns persistent, structured, and reusable.

### AI tutors

Many AI tutors attempt to simulate one-on-one instruction and may include exercises, hints, or automated evaluation.

Quandary is less focused on delivering a predefined curriculum. It is closer to an environment for self-directed learners who already have notes, sources, projects, and questions they want to explore.

## What Quandary Is Not

Quandary is not merely a flashcard generator. Flashcards may be one output, but they are not the organizing principle.

It is not merely a chatbot over documents. Retrieval supports the learning process but does not define it.

It is not an automated grader that claims to know the learner's true mastery.

It is not a summarization tool designed to minimize contact with the source material.

It is not a replacement for reading, writing, solving problems, or thinking independently.

It is not a black-box knowledge base whose contents can only be accessed through AI.

The system succeeds only if it helps the learner do more of the intellectual work that produces understanding.

## Key Product and Research Questions

Several difficult questions remain open.

- How should Quandary distinguish a productive question from a shallow one?
- How can it challenge the learner without turning every session into an interrogation?
- When should it provide an answer, and when should it preserve uncertainty or struggle?
- How should it separate source-backed claims from model-generated speculation?
- What learning-state information is useful enough to justify storing?
- How can review scheduling remain helpful without becoming intrusive?
- How should the system evaluate its own usefulness?
- What kinds of user feedback should shape future sessions?
- How can artifacts remain clean and readable rather than becoming cluttered with AI output?
- How can local and hosted models be supported without fragmenting the experience?
- How should Quandary handle disagreement among the learner's notes, external sources, and the model?
- What should be automated, and what should remain explicitly under user control?

These are not secondary implementation details. They define the product.

## A Practical MVP

The first version of Quandary should be narrower than the full vision.

A plausible MVP could include:

- a local folder of Markdown notes;
- the ability to select one or more notes for a session;
- a small set of dialogue modes;
- retrieval from the selected notes;
- explicit citations to source passages;
- a session transcript;
- generation of a revised note or session artifact;
- lightweight user ratings;
- and manual or semi-automatic review scheduling.

The MVP does not need a complex knowledge graph, fully automated mastery estimation, a workflow marketplace, or a universal scheduling algorithm.

Its primary test should be simple: does the system help a learner uncover gaps and produce better notes than they would through ordinary reading or unstructured chat?

## The Longer-Term Vision

The longer-term vision for Quandary is a general framework for reflective knowledge work.

Learning is is the underlying process of how people acquire, test, organize, revise, and apply knowledge. If Quandary can support that process well, the same foundation can extend naturally into:
- technical interview preparation
- research
- software design reviews
- argument development
- professional training
- long-term project reflection

Across these domains, the underlying pattern is similar. The user has a body of material, a developing understanding, and a goal. The AI helps structure the interaction, surface gaps, introduce relevant evidence, and produce durable artifacts.

Quandary is therefore not an AI tutor. It is an attempt to build an environment in which conversation, recall, notes, sources, and reflection become parts of one coherent system.
