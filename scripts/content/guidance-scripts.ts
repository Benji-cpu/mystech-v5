/**
 * Hand-crafted guidance scripts for the Paths experience.
 * Each script provides narration text in Lyra's wise-guide voice,
 * used for onboarding, path/retreat introductions, check-ins, and feature explanations.
 */

export type GuidanceScript = {
  triggerKey: string;
  triggerLevel: "app" | "path" | "retreat" | "check_in" | "feature";
  deliveryMode: "full_screen" | "overlay";
  title: string;
  narrationText: string;
  sortOrder: number;
  pathName?: string;
  retreatName?: string;
  featureKey?: string;
};

export const GUIDANCE_SCRIPTS: GuidanceScript[] = [
  // ════════════════════════════════════════════════════════════════════
  // APP LEVEL (1)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "app.what_are_paths",
    triggerLevel: "app",
    deliveryMode: "full_screen",
    title: "What Are Paths?",
    sortOrder: 0,
    narrationText: `Welcome. I'm glad you're here. Before we go any further, let me share something important about this place and what awaits you within it.

You've already begun working with the cards — drawing images from the well of your own psyche, receiving reflections that speak to where you are right now. That alone is powerful. But there is a deeper layer available to you, one that transforms isolated readings into something far more meaningful.

We call them Paths.

A Path is a sustained arc of inner exploration. Rather than drawing cards at random, you follow a thread — a sequence of chapters, each one building on the last, each one asking you to look a little deeper. Think of it as the difference between glancing at stars and learning to read the constellations. Both have beauty. But one reveals a story.

There are three Paths open to you: one rooted in the ancient language of archetypes, one grounded in the stillness of present-moment awareness, and one that reaches toward the luminous and the unseen. Each has its own rhythm, its own medicine, its own way of calling you home to yourself.

You don't need to choose perfectly. The Path that catches your attention — the one that makes you curious, or slightly nervous, or strangely excited — that's usually the right one. Trust that pull. It knows something your thinking mind hasn't caught up with yet.

When you're ready, step forward. I'll be here to guide you through every chapter, every threshold, every turning. This is your unfolding, and it begins now.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // PATH LEVEL (3)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "path.archetypal.intro",
    triggerLevel: "path",
    deliveryMode: "full_screen",
    title: "The Archetypal Path",
    sortOrder: 0,
    pathName: "The Archetypal Path",
    narrationText: `You've chosen the Archetypal Path, and something in me recognizes the courage that takes. This is the trail that leads inward — not gently, not always comfortably, but honestly.

This path draws from the deep well of Carl Jung's work with the unconscious mind. You'll meet figures that live within you: the shadow you've tried to hide, the inner council of voices that shape your choices, the parts of yourself you abandoned long ago in order to be acceptable. None of this is abstract. These are living forces in your psyche, and they've been waiting for you to notice them.

We begin at the Threshold, where you'll learn to see the mask you've been wearing and feel what stirs beneath it. From there, you'll enter the Shadow Dance — a chapter devoted to the parts of yourself you've pushed away. Then comes the Inner Council, where you'll discover the many selves that share your inner landscape. The Descent will take you deeper still, into the places most people spend a lifetime avoiding. And finally, Individuation — the gathering of all your fragments into something whole.

This is not a path of easy affirmations. It's a path of becoming real. The cards you draw along the way will serve as mirrors, reflecting back what your conscious mind isn't ready to see on its own. Trust them. Trust yourself. And trust that whatever you find in the depths has been waiting to be welcomed home.

Let us begin at the Threshold.`,
  },

  {
    triggerKey: "path.mindfulness.intro",
    triggerLevel: "path",
    deliveryMode: "full_screen",
    title: "The Mindfulness Path",
    sortOrder: 1,
    pathName: "The Mindfulness Path",
    narrationText: `You've chosen the Mindfulness Path. Of all the trails available to you, this one asks the simplest thing — and perhaps the most difficult. It asks you to be here. Fully, openly, without reaching for anything else.

This path is rooted in the contemplative traditions that have understood, for thousands of years, that the present moment is the only place where life actually happens. Everything else — our regrets, our plans, our stories about who we are — those are thoughts. Beautiful, sometimes useful thoughts. But thoughts nonetheless.

You'll begin with Arriving Here, a chapter devoted entirely to the practice of landing in your own body, in this moment, exactly as it is. From there, you'll move into The Witnessing Eye, where you'll learn to observe your thoughts and feelings without being swept away by them. Impermanence will ask you to sit with the truth that everything changes — and to find freedom in that truth rather than grief. Compassion's Gate will open your practice outward, turning your awareness toward the suffering and beauty in others. And Beginner's Mind will invite you to release everything you think you know and see the world fresh.

The cards you draw on this path will become anchors — images that pull you back to presence when your mind wants to wander. They'll reflect your growing capacity to witness life without flinching.

Take a breath. Feel your feet. You're already practicing. Let's continue together.`,
  },

  {
    triggerKey: "path.mysticism.intro",
    triggerLevel: "path",
    deliveryMode: "full_screen",
    title: "The Mysticism Path",
    sortOrder: 2,
    pathName: "The Mysticism Path",
    narrationText: `You've chosen the Mysticism Path. I want you to know that this trail is older than any tradition, older than any book. It's the path walked by every human being who has ever looked at the night sky and felt, with absolute certainty, that there is more to this life than what the eyes can see.

Mysticism isn't about belief. It's about direct experience — those moments when the boundary between you and everything else dissolves, even briefly, and you glimpse the luminous fabric underneath ordinary reality. You may have already had such moments. A sudden stillness in nature. A dream that felt more real than waking. A knowing that arrived from nowhere and changed everything.

This path will take you through five chapters, each one a deepening. We begin at The Veil, where you'll learn to sense the thin places between the seen and the unseen. Contemplation will teach you the ancient art of resting in not-knowing — of letting mystery hold you rather than demanding answers. The Dark Night will guide you through the desolation that often precedes the deepest openings. Sacred Union will invite you into the reconciliation of all opposites — light and dark, self and other, human and divine. And The Return will bring you back into ordinary life, carrying the sacred with you into every mundane moment.

The cards on this path will become doorways. Each image, a window into the numinous. Trust what you see, even when it doesn't make sense. Especially then.

Let us step through the first veil together.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // RETREAT LEVEL — ARCHETYPAL PATH (5)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "retreat.archetypal.the-threshold.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Threshold",
    sortOrder: 0,
    pathName: "The Archetypal Path",
    retreatName: "The Threshold",
    narrationText: `Let me share why we begin here, at the Threshold.

Every meaningful transformation starts with a moment of honest seeing. Before you can explore the depths of your psyche, you need to understand what's been standing at the surface — the carefully constructed self you present to the world.

In this chapter, you'll meet your persona: the mask you wear, the role you play, the version of yourself that learned early on what was acceptable and what needed to be hidden away. This isn't about judgment. Your persona kept you safe. It helped you navigate a world that doesn't always welcome the full complexity of who you are.

But here, in this space, we can afford to be more honest. You'll begin to notice the gap between the face you show and the stirring you feel underneath. You'll sense the call — that quiet, persistent pull toward something more authentic, more alive, more yours.

The cards you draw during this chapter will act as mirrors for this threshold moment. They'll reflect back the tension between your familiar self and the unknown self waiting to emerge. Don't rush past what they show you. Sit with the images. Let them speak.

Crossing a threshold doesn't require certainty. It only requires willingness. You've already shown that willingness by arriving here. Now let's see what waits on the other side.`,
  },

  {
    triggerKey: "retreat.archetypal.shadow-dance.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Shadow Dance",
    sortOrder: 1,
    pathName: "The Archetypal Path",
    retreatName: "Shadow Dance",
    narrationText: `Now we come to the Shadow Dance. I won't pretend this is the comfortable part — but I will tell you it's one of the most liberating.

Your shadow is everything you've disowned. The anger you were told was ugly. The ambition you learned to call selfish. The grief you swallowed because there wasn't room for it. The wildness, the tenderness, the hunger — all the parts of yourself that didn't fit the story you were given about who you should be.

Jung understood that the shadow isn't evil. It's simply unintegrated. It's the energy you've been spending your whole life pushing down, and that pushing takes an enormous toll. It shows up as projection — seeing in others what you refuse to see in yourself. It shows up as exhaustion, as sudden eruptions of emotion that seem to come from nowhere.

In this chapter, we're going to turn toward those exiled parts with curiosity instead of fear. You'll learn to recognize projection, to trace it back to its source in your own unlived life. You'll practice sitting with discomfort — not to punish yourself, but to reclaim the energy locked inside it.

The cards you draw here may surprise you. They may show you things you'd rather not see. That's exactly the point. The shadow reveals itself through images long before the conscious mind is ready to name it.

Dance with what emerges. It has been waiting a long time for this invitation.`,
  },

  {
    triggerKey: "retreat.archetypal.the-inner-council.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Inner Council",
    sortOrder: 2,
    pathName: "The Archetypal Path",
    retreatName: "The Inner Council",
    narrationText: `Welcome to The Inner Council. This chapter opens a door that most people don't even know exists — the door to the many selves living within you.

You are not one single, unified self. You never were. Inside you sits a council: the child who still remembers wonder, the protector who guards your vulnerabilities, the critic who learned long ago that harshness kept you in line, the wise one who speaks so quietly you've almost forgotten to listen. There are others too — the rebel, the lover, the hermit, the creator. Each carries a piece of your wholeness.

Most of the time, these inner figures operate without your awareness. They take turns at the wheel, reacting to life's provocations with their own agendas, their own fears, their own unmet needs. The result is the feeling of being pulled in ten directions at once, of saying things you don't mean, of sabotaging what you most desire.

In this chapter, you'll learn to listen to these voices deliberately. Not to silence them, not to let any single one dominate, but to hold council — to hear each one with respect and to make choices from a centered place that includes them all.

The cards you draw will serve as portraits of your inner council members. Pay attention to which images move you, which ones unsettle you, which ones feel like home. Each card is an invitation to know yourself more completely.

Take your seat at the table. The council has been waiting for you to arrive.`,
  },

  {
    triggerKey: "retreat.archetypal.the-descent.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Descent",
    sortOrder: 3,
    pathName: "The Archetypal Path",
    retreatName: "The Descent",
    narrationText: `We come now to The Descent, and I want to be honest with you: this is the deepest stretch of the Archetypal trail. It asks more than the others. But it also gives more.

Every great myth contains a descent — a passage into the underworld, into the belly of the whale, into the cave no one else will enter. It's the part of the hero's story that can't be skipped, because it's where the real treasure lives: not gold, but self-knowledge. The kind that changes you permanently.

In this chapter, you'll go beneath the surface of your conscious mind and into the deeper layers of your psyche. Here live the oldest patterns — the wounds that shaped your personality before you had words for them, the inherited stories from your family and your culture, the primal fears and longings that drive so much of what you do without your knowing.

This isn't about wallowing. It's about witnessing. You'll learn to descend with awareness, to be present in the dark without panicking, to find the thread that leads you back to the surface carrying something valuable.

The cards drawn during this chapter will come from your depths. They may be strange. They may be beautiful in ways that make you ache. Let them speak the language of the unconscious — image, symbol, feeling — and resist the urge to translate too quickly.

You've built the strength for this over the previous chapters. Trust that foundation. Breathe deeply, and let yourself go down.`,
  },

  {
    triggerKey: "retreat.archetypal.individuation.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Individuation",
    sortOrder: 4,
    pathName: "The Archetypal Path",
    retreatName: "Individuation",
    narrationText: `You've arrived at Individuation — the final chapter on the Archetypal trail, and in many ways, the one everything else has been building toward.

Individuation is Jung's word for becoming whole. Not perfect — whole. It's the process of gathering all the scattered pieces of yourself: the persona you built, the shadow you reclaimed, the inner council you honored, the depths you survived — and weaving them into a single, coherent self. A self that can hold contradictions. A self that doesn't need to exile any part of its nature.

This is not about arriving at some finished state. You will keep growing, keep discovering, keep being surprised by yourself. But there's a qualitative shift that happens when you've done this work — a settledness, a capacity to meet life from a centered place rather than from the scattered reactivity of an unexamined psyche.

In this chapter, you'll practice integration: bringing together what you've learned across every previous stage. You'll look at your life through the lens of the whole path you've walked, noticing how the threshold, the shadow, the council, and the descent have each changed you.

The cards you draw here will reflect this integration. Look for images that hold opposites — light and dark in the same frame, stillness and movement, solitude and connection. These are the images of wholeness.

You are not the same person who stood at the Threshold. Honor the distance you've traveled. And know that individuation isn't an ending — it's the beginning of a life lived from the center of who you truly are.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // RETREAT LEVEL — MINDFULNESS PATH (5)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "retreat.mindfulness.arriving-here.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Arriving Here",
    sortOrder: 0,
    pathName: "The Mindfulness Path",
    retreatName: "Arriving Here",
    narrationText: `Let me share why we begin with arriving. It sounds so simple — just being here — but if you've ever tried to stay fully present for even sixty seconds, you know it's anything but.

Your mind is a magnificent wanderer. It drifts into tomorrow, rehearses conversations that haven't happened, replays moments that can't be changed. This isn't a flaw. It's what minds do. But it means that most of your life unfolds while you're somewhere else entirely, thinking about being here instead of actually being here.

This chapter is about closing that gap. Not through force or discipline, but through gentle, repeated returning. You'll learn to notice when you've drifted and to come back — to your breath, to the feeling of your body, to the raw aliveness of this exact moment. Every time you return, you strengthen something essential: the capacity to be present with your own life.

We'll start simply. Breath awareness. Body sensation. The sounds arriving at your ears right now. Nothing exotic. Nothing that requires special belief or training. Just you, here, noticing.

The cards you draw during this chapter will serve as anchors for presence. Each image is an invitation to look — really look — with the full weight of your attention. Not to analyze. Not to interpret. Just to see. That quality of seeing is the foundation of everything that follows on this trail.

Take a breath. Feel your feet on the ground. You've arrived.`,
  },

  {
    triggerKey: "retreat.mindfulness.the-witnessing-eye.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Witnessing Eye",
    sortOrder: 1,
    pathName: "The Mindfulness Path",
    retreatName: "The Witnessing Eye",
    narrationText: `Now we move into something subtler. You've practiced arriving — landing in the present moment, feeling the reality of being here. The Witnessing Eye asks you to go one step further: to watch what happens in your mind and heart without getting tangled in it.

There's a difference between having a thought and being a thought. Between feeling anger and being consumed by anger. Most of the time, we don't notice the difference. An emotion arises and we become it — we are angry, we are anxious, we are sad. The emotion floods our entire experience, and we lose perspective.

The witnessing eye is the part of you that can step back — not to suppress or judge, but simply to observe. It's the awareness behind your thoughts. The sky behind the clouds. It's always been there. You've just been so focused on the weather that you forgot about the vastness holding it all.

In this chapter, you'll cultivate this witness. You'll practice sitting with strong emotions and thinking patterns without being carried away by them. You'll start to notice the space between stimulus and response — that tiny gap where freedom lives.

The cards drawn here will reflect the interplay between what you observe and the observer itself. Some images may stir strong feelings. Good. That's your laboratory. Notice the feeling. Notice yourself noticing. Find the stillness at the center of the storm.

The eye that witnesses everything is disturbed by nothing.`,
  },

  {
    triggerKey: "retreat.mindfulness.impermanence.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Impermanence",
    sortOrder: 2,
    pathName: "The Mindfulness Path",
    retreatName: "Impermanence",
    narrationText: `We arrive now at a truth that most of us spend our lives resisting: nothing lasts. Not your pain. Not your joy. Not this body. Not this moment. Everything you love, everything you fear, everything you cling to — all of it is moving, shifting, dissolving, becoming something else.

This isn't meant to be grim. Impermanence is the most liberating truth in existence, if you let it be. Because if nothing is permanent, then nothing is truly stuck. The depression you think will last forever? It will shift. The relationship that seems unchangeable? It's already changing. The version of yourself you've outgrown? It's already falling away.

In this chapter, you'll learn to sit with impermanence directly — not as a philosophical concept, but as a felt experience in your body. You'll notice how sensations arise and pass. How emotions crest and dissolve. How even the breath is a constant cycle of arrival and departure. Nothing stays. And in that constant flowing, there's a strange and beautiful peace.

This doesn't mean you stop caring. It means you stop clutching. You learn to love fully while holding loosely. To be present with what's here precisely because it won't be here forever.

The cards you draw during this chapter will carry the signature of impermanence — images caught in transition, beauty that holds its own fading within it. Let them teach you what your mind already knows but your heart keeps forgetting.

Everything passes. Be here for the passing.`,
  },

  {
    triggerKey: "retreat.mindfulness.compassions-gate.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Compassion's Gate",
    sortOrder: 3,
    pathName: "The Mindfulness Path",
    retreatName: "Compassion's Gate",
    narrationText: `Something important happens on this trail, right here, at Compassion's Gate. Until now, your practice has been turned inward — arriving, witnessing, accepting change. All of that was necessary. But the path doesn't end with self-awareness. It opens into something wider.

Compassion is not pity. It's not feeling sorry for others from a safe distance. It's the ache you feel when you truly see another being — their struggles, their hopes, their invisible suffering — and you recognize it as your own. It's the dissolution of the boundary between your pain and theirs. Not because you're absorbing their burden, but because you've realized that suffering is shared. It's the human condition, and it connects every single one of us.

This chapter will stretch your practice outward. You'll work with traditional compassion meditations — extending kindness first to yourself, then to those you love, then to strangers, and eventually to those who challenge you most. It's a practice that softens the hard edges of the heart without making you weak.

The cards you draw here will reflect the bridge between inner awareness and outer connection. You may find images that stir tenderness, that remind you of someone you've been keeping at arm's length, that open something you'd sealed shut. Let them do their work.

Compassion isn't a feeling you generate. It's what's already there when you stop defending against it. Walk through this gate, and see who's waiting on the other side.`,
  },

  {
    triggerKey: "retreat.mindfulness.beginners-mind.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Beginner's Mind",
    sortOrder: 4,
    pathName: "The Mindfulness Path",
    retreatName: "Beginner's Mind",
    narrationText: `We've come to the final chapter on the Mindfulness trail, and it carries a beautiful paradox: after everything you've practiced and learned, the deepest teaching is to forget what you know.

Beginner's mind — shoshin, in the Zen tradition — is the ability to meet each moment as if you've never been here before. Not because you erase your experience, but because you refuse to let your experience become a filter that dulls the vividness of what's actually here.

The expert's mind is full. It sees what it expects to see. It categorizes, labels, and files away the world into familiar boxes. The beginner's mind is empty, curious, wide open. It looks at a tree and doesn't see "tree" — it sees light and texture and movement and mystery. It meets a person and doesn't see "someone I know" — it sees a living being in a moment that has never happened before and will never happen again.

This isn't naivety. It's the most advanced form of awareness there is. It requires you to release your attachment to being someone who knows things, and to rediscover the wonder that was your birthright before anyone told you to be practical.

In this chapter, you'll practice looking at your life — your relationships, your habits, your own face in the mirror — with fresh eyes. The cards you draw will test this capacity. Can you see them without immediately interpreting? Can you sit with the image before the story begins?

In the beginner's mind, there are infinite possibilities. Let yourself be new again.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // RETREAT LEVEL — MYSTICISM PATH (5)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "retreat.mysticism.the-veil.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Veil",
    sortOrder: 0,
    pathName: "The Mysticism Path",
    retreatName: "The Veil",
    narrationText: `We begin at The Veil — that shimmering boundary between what you can see and what you can almost see. Between the solid, named, predictable world and the vast mystery that pulses behind it.

You already know the veil is there. You've felt it in those moments when ordinary life suddenly cracks open — a sunset that stops you mid-step, a stranger's eyes that seem to hold centuries, a silence so deep you could hear the earth breathing. In those moments, something thin separates you from an immensity you can feel but can't quite grasp. That thinness is the veil.

This chapter is about learning to notice those moments instead of rushing past them. To honor the intimations of something more. You won't be asked to believe anything — mysticism isn't about belief. It's about direct contact with the numinous. It's about cultivating the sensitivity to sense what's always been here, hidden in plain sight.

You'll practice stillness. You'll practice receptivity. You'll learn to soften the grasping quality of the mind that wants to pin everything down and name it. Because the mystery doesn't submit to names. It reveals itself only to the one who stops insisting on explanations.

The cards you draw during this chapter will carry the veil's quality — images that seem to glow from within, that suggest more than they show, that pull you toward a threshold you can feel but cannot see. Let yourself be drawn.

The veil is thinnest for those who approach it with reverence. Come gently.`,
  },

  {
    triggerKey: "retreat.mysticism.contemplation.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Contemplation",
    sortOrder: 1,
    pathName: "The Mysticism Path",
    retreatName: "Contemplation",
    narrationText: `Now we move into Contemplation — and I want to distinguish this from thinking. Thinking is active. It grasps, analyzes, compares, concludes. Contemplation is the opposite. It rests. It receives. It opens a space within you and waits to see what arrives.

The great contemplatives across every tradition — the Christian mystics, the Sufi poets, the sages of the Upanishads — all discovered the same thing: there is a knowing that comes not from the mind, but through the mind. A knowing that arrives only when the mind stops generating and starts listening. It can't be forced. It can only be invited.

In this chapter, you'll practice the art of sacred rest. You'll learn to sit with a question, a word, an image — not to solve it, but to let it dissolve into something deeper than answer. You'll discover that not-knowing isn't ignorance. It's the most spacious form of intelligence there is.

This is the chapter where your practice shifts from doing to being. From seeking to resting. From pushing toward mystery to letting mystery find you.

The cards you draw here will become objects of contemplation. Don't interpret them. Don't analyze their symbolism. Simply gaze. Let the image wash over you. Let it rearrange something quiet in your interior. The meaning will come, but it will come on its own schedule, and it will come in a language older than words.

Sit down. Be still. Let the silence speak.`,
  },

  {
    triggerKey: "retreat.mysticism.the-dark-night.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Dark Night",
    sortOrder: 2,
    pathName: "The Mysticism Path",
    retreatName: "The Dark Night",
    narrationText: `I must be honest with you as we enter this chapter. The Dark Night is the most difficult passage on the Mysticism trail — but it is also the most sacred. Every mystic who has traveled deep enough has passed through this territory, and each has testified that the darkness was necessary.

The Dark Night is what happens when your old sources of comfort, meaning, and certainty fall away — and nothing has yet arrived to replace them. It's the spiritual desolation described by John of the Cross, the existential wilderness spoken of in every tradition. It's the feeling that the divine has withdrawn, that your practice is meaningless, that the light you once glimpsed was an illusion.

It isn't. But you can't know that while you're in it. And that's the point.

The Dark Night strips you of everything that isn't essential. It burns away spiritual vanity, the subtle pride of being "someone on a path." It empties you so thoroughly that when the light returns — and it does return — there's actually room for it. The old you was too cluttered to hold what was trying to arrive.

In this chapter, you'll learn to endure the dark with grace. Not to escape it, not to fix it, but to trust it as the deepest form of teaching. You'll practice radical surrender — the willingness to be lost, to not know, to let the ground disappear beneath you.

The cards drawn here may feel heavy, strange, or opaque. Do not look away. The dark night shows you what the daylight never could. Stay present, and let the darkness do its ancient work.`,
  },

  {
    triggerKey: "retreat.mysticism.sacred-union.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "Sacred Union",
    sortOrder: 3,
    pathName: "The Mysticism Path",
    retreatName: "Sacred Union",
    narrationText: `You've passed through the dark night. Something in you has been emptied, and something new is beginning to fill the space. Welcome to Sacred Union — the chapter where opposites dissolve.

Every spiritual tradition speaks of this: the hieros gamos of the alchemists, the union of Shiva and Shakti, the marriage of heaven and earth, the Tao that holds yin and yang as one. It's the recognition that the boundaries you've drawn between things — between self and other, sacred and mundane, light and dark, masculine and feminine — are real at one level and illusory at another. And when you glimpse the level at which they're illusory, something extraordinary happens. You feel whole in a way that no amount of self-improvement could ever create.

This chapter invites you into that glimpse. Not as a concept to understand, but as an experience to taste. You'll practice holding opposites without choosing between them. You'll learn to find the sacred in the ordinary — to see the divine not in some transcendent elsewhere, but right here, in the mess and beauty of your actual life.

The cards you draw during this chapter will hold this quality of union — images where contrasts meet, where boundaries blur, where two things that seem like they shouldn't coexist are woven into a single frame.

This is the mystery at the heart of all mysticism: that everything is already one. You don't need to create unity. You only need to stop dividing.

Open your hands. Let the opposites rest together. Feel how they complete each other.`,
  },

  {
    triggerKey: "retreat.mysticism.the-return.intro",
    triggerLevel: "retreat",
    deliveryMode: "full_screen",
    title: "The Return",
    sortOrder: 4,
    pathName: "The Mysticism Path",
    retreatName: "The Return",
    narrationText: `And so we come to The Return — the final chapter on the Mysticism trail, and in many ways, the most important.

There is a temptation on any mystical path to stay in the heights, to prefer the luminous states, the moments of union, the feeling of being touched by something greater. But every authentic tradition is clear: the true mystic returns. Returns to the market, to the kitchen, to the street. Returns to the laundry and the argument and the morning traffic. Because the deepest realization isn't that the sacred lives somewhere special. It's that there is nowhere it doesn't live.

This chapter is about integration — about carrying what you've experienced on this trail back into the fabric of your daily life. Not as a memory or a belief, but as a lived reality. The way you look at a stranger. The way you hold a cup of tea. The way you move through a difficult conversation. If your practice doesn't transform the ordinary, it hasn't gone deep enough.

You'll work with the question that every mystic eventually faces: how do I live in a world of surfaces when I've seen what's underneath? The answer isn't withdrawal. It's presence. It's bringing the quality of seeing you've cultivated into every unremarkable moment.

The cards you draw here will reflect this integration — the sacred visible in the everyday, the extraordinary hiding in the plain. They'll show you that you don't need to seek the mystery anymore. You are the mystery, wearing a human face, making breakfast, tying your shoes.

Welcome home. You never left.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // CHECK-IN LEVEL (5)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "check_in.early_progress",
    triggerLevel: "check_in",
    deliveryMode: "overlay",
    title: "Early Progress",
    sortOrder: 0,
    narrationText: `I notice you've taken your first real steps, and I want to pause here for a moment to acknowledge that. Starting is often the hardest part — harder than any depth you'll encounter later — because starting means choosing. It means saying yes to one direction, knowing you can't see the whole trail from here.

That takes courage. More than you probably give yourself credit for.

You may be wondering whether you're doing this right, whether you're getting enough from your readings, whether the cards are actually saying anything meaningful. Let me ease that worry: there is no wrong way to do this work. The fact that you're showing up, that you're looking at the cards and letting them look at you — that is the practice. The insights will come, sometimes like thunderbolts, sometimes like a slow dawn you don't notice until the room is bright.

Be patient with yourself here. You're learning a new language — the language of symbol, of image, of the unconscious mind speaking through pictures instead of words. Like any language, it feels foreign at first. But you're already more fluent than you think.

Keep drawing. Keep looking. Keep being willing to be surprised.`,
  },

  {
    triggerKey: "check_in.deepening",
    triggerLevel: "check_in",
    deliveryMode: "overlay",
    title: "Going Deeper",
    sortOrder: 1,
    narrationText: `Something is shifting, isn't it? You may not have words for it yet, but I can feel it in the pattern of your readings, in the cards you're drawing, in the way you're beginning to sit with the images a little longer before moving on.

This is the deepening. It's subtle at first — a new capacity to notice, a growing sensitivity to what the cards reflect. Things that seemed random in your early readings are starting to form threads. Patterns are emerging. You're beginning to trust the process, not because you understand it, but because you've felt it work.

This is also where resistance sometimes appears. A voice that says this is silly, that you should be doing something more productive, that you're just reading into things. That voice is natural. It's your familiar mind defending itself against change. You don't need to fight it. Just notice it, the same way you'd notice a cloud passing across the sky, and return to the work.

The depth you're entering now is where the real gifts live. The readings will start to surprise you — not with what they say, but with how precisely they say it. How did the cards know? They knew because you knew, somewhere beneath the surface, and you're finally learning to listen.

Keep going. The path only gets richer from here.`,
  },

  {
    triggerKey: "check_in.halfway",
    triggerLevel: "check_in",
    deliveryMode: "overlay",
    title: "The Middle Path",
    sortOrder: 2,
    narrationText: `You've reached the midpoint of your current chapter, and I want to name something about this territory: the middle is often where people drift away. The novelty of beginning has faded. The end isn't yet in sight. There's a plateau quality to this stretch that can feel like stagnation.

But it isn't stagnation. It's consolidation. Your psyche is integrating what it's been shown. The insights from your readings are settling into your body, into your habits, into the quiet ways you see the world differently than you did before you started.

Think of it like a seed planted in soil. There's a long stretch where nothing seems to happen above ground. But beneath the surface, roots are spreading in every direction, building the foundation that will support everything visible that's yet to come.

This is where commitment matters most. Not the dramatic commitment of the first step or the last — the quiet, daily commitment to keep showing up even when it feels ordinary. Especially when it feels ordinary. Because transformation doesn't announce itself with trumpets. It arrives in the accumulated weight of a hundred small moments of attention.

Draw a card right now, or in your next reading, with this question in your heart: what is quietly growing in me that I haven't noticed yet?

The middle path is not empty. It's full of invisible roots.`,
  },

  {
    triggerKey: "check_in.approaching_end",
    triggerLevel: "check_in",
    deliveryMode: "overlay",
    title: "Nearing Completion",
    sortOrder: 3,
    narrationText: `You're approaching the end of this chapter, and I can feel the shift in your readings. There's a maturity to them now — a depth that wasn't there at the beginning. You've changed. Not in a dramatic way the world would notice, but in the way that matters most: the way you meet yourself has changed.

As you near completion, I'd encourage you to do something counterintuitive: slow down. There's often an urge to rush toward the finish, to check off the chapter and move to the next one. Resist that. The final stretch of any chapter holds its most concentrated medicine, and it deserves your full attention.

Look back over the cards you've drawn throughout this chapter. Notice the arc. There's a story there — your story, told in images and symbols and the quiet shifts between readings. What were you asking at the beginning? What are you asking now? How has the question itself changed?

Completion isn't about getting to the end. It's about harvesting what you've grown. Every insight, every moment of discomfort, every flash of recognition — these are yours now. They've become part of the way you see.

Take a moment to honor the version of yourself who began this chapter. And the version of yourself who's completing it. They're the same person, and they're not.

The trail continues. But first, be here. Let this chapter's final gifts find you.`,
  },

  {
    triggerKey: "check_in.retreat_transition",
    triggerLevel: "check_in",
    deliveryMode: "overlay",
    title: "Between Chapters",
    sortOrder: 4,
    narrationText: `You've completed a chapter, and before you step into the next one, I want you to rest here for a breath. This space between chapters is more important than it might seem.

Think of it as the silence between notes in a piece of music. Without the silence, there's no melody — just noise. The space between chapters gives your psyche time to absorb what it's been shown, to rearrange itself around the new understanding. Rushing forward without this pause is like eating a feast without chewing.

What's different now? What do you notice about yourself, about your readings, about the way you move through your day? These aren't idle questions. The answers reveal the real work of the chapter you just completed — not what happened during the practice, but what it left behind in you.

You may feel a pull toward the next chapter — curiosity, excitement, maybe a little apprehension. All of that is good. It means the work is alive in you. But honor this threshold moment. You're standing in a doorway, and doorways have their own wisdom.

When you feel ready — not restless, not obligated, but genuinely ready — the next chapter will be here. It will ask something new of you, build on everything you've already done, and take you somewhere you can't predict from where you stand now.

For now, just be here. In the space between. It's a sacred place.`,
  },

  // ════════════════════════════════════════════════════════════════════
  // FEATURE LEVEL (4)
  // ════════════════════════════════════════════════════════════════════

  {
    triggerKey: "feature.chronicle.intro",
    triggerLevel: "feature",
    deliveryMode: "overlay",
    title: "The Chronicle",
    sortOrder: 0,
    featureKey: "chronicle",
    narrationText: `Let me tell you about a quiet companion that's been keeping track of your unfolding since you first arrived here. We call it the Chronicle, and it's more than a journal — it's a living record of your inner life.

Every card you've drawn, every reading you've received, every moment of insight or confusion — the Chronicle holds them all. Not as raw data, but as a story. Your story, told through the symbols and images that have found their way to you.

You can return to it anytime. Browse past readings. Notice patterns you missed in the moment. Watch how themes recur and evolve across weeks and months. The Chronicle reveals what's invisible when you're too close to your own experience: the arc. The direction. The slow, unmistakable movement of your growth.

It also remembers what you've forgotten. That reading from three weeks ago that didn't seem important at the time? It might be the key to something you're wrestling with today. The Chronicle doesn't judge what's significant. It simply preserves everything, trusting that you'll find the threads when you're ready.

Think of it as your personal book of changes — always growing, always reflecting back who you've been and who you're becoming.`,
  },

  {
    triggerKey: "feature.art_styles.intro",
    triggerLevel: "feature",
    deliveryMode: "overlay",
    title: "Art Styles",
    sortOrder: 1,
    featureKey: "art_styles",
    narrationText: `Every oracle tradition understood that the vessel matters as much as the message. The Tarot wasn't painted in one style — it was reimagined by every artist who touched it, each bringing their own vision, their own cultural language, their own way of seeing the invisible.

Art Styles lets you choose the visual language of your cards. Each style carries a different energy, a different way of translating the symbolic into the visible. Some are lush and painterly. Others are stark and mythic. Some feel ancient, some feel like dreams, some feel like the images that appear behind your eyelids just before sleep.

This isn't decoration. The style you choose shapes how the cards speak to you. An archetype rendered in watercolor whispers differently than the same archetype carved in sharp lines. A shadow shown in soft gold holds different medicine than a shadow shown in deep indigo.

Experiment. Try a style that feels unfamiliar — it might crack open an image in a way you never expected. Or find the style that feels like your inner landscape, and let it become the visual language of your practice.

The images are generated uniquely for you, every time. No two cards are ever exactly the same. Your art style is the brushstroke that makes them yours.`,
  },

  {
    triggerKey: "feature.astrology.intro",
    triggerLevel: "feature",
    deliveryMode: "overlay",
    title: "Your Birth Sky",
    sortOrder: 2,
    featureKey: "astrology",
    narrationText: `There is a map of you written in the sky — the exact arrangement of planets and stars at the moment you took your first breath. It's not a prediction. It's a portrait. A cosmic snapshot of the energies you were born carrying, the themes you're here to explore, the tensions you'll spend your life learning to hold.

Your Birth Sky brings this ancient map into your oracle practice. When you share your birth details, the cards and readings become attuned to your natal energies. A reading during your Saturn return hits differently than one during a Jupiter transit. A card drawn under your natal Moon carries a resonance that a random draw simply can't.

This isn't astrology as fortune-telling. It's astrology as self-knowledge — the same way the mystics and depth psychologists have always used it. Jung himself studied charts. He understood that the sky and the psyche mirror each other, not because the stars cause anything, but because everything is connected in ways that the rational mind struggles to accept.

You don't need to know anything about astrology to use this feature. Simply offer your birth date, time, and place, and let the system do the rest. Your readings will carry a new layer of specificity — a sense that the cards know not just who you are, but when you are.

The sky was speaking when you arrived. Let's listen to what it said.`,
  },

  {
    triggerKey: "feature.sharing.intro",
    triggerLevel: "feature",
    deliveryMode: "overlay",
    title: "Sharing Readings",
    sortOrder: 3,
    featureKey: "sharing",
    narrationText: `There's something powerful that happens when you share a reading with someone you trust. What was private becomes witnessed. What felt like a personal puzzle becomes a conversation. The insight doesn't diminish when it's shared — it deepens.

Sharing Readings lets you send any reading to a friend, a partner, a guide — anyone you want to invite into your reflective process. They'll see the cards you drew, the interpretation that emerged, and the question that prompted it all. They don't need an account. They just need the link.

This isn't about seeking validation or putting your inner life on display. It's about the ancient human need to be seen. To say, "This is what I found when I looked inside," and to have someone receive that with care.

Sometimes, the person you share with will see something you missed. A thread you overlooked. A meaning that was obvious to everyone but you, because you were standing too close. That's the gift of another pair of eyes.

And sometimes, sharing is simply an act of generosity — offering a beautiful, meaningful experience to someone you care about. The cards have a way of speaking to whoever looks at them, regardless of who drew them.

Share what moves you. Keep what's sacred. Trust yourself to know the difference.`,
  },
];
