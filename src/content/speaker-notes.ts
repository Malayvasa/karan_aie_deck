/**
 * Speaker notes for the deck, sourced from `karan-speech.md` in the Sundial
 * workspace (the live "Full speaker script — Karan Vaidya"). Each entry is keyed
 * by a stable slide key and carries the speech `section` label plus the spoken
 * `script` for that slide.
 *
 * The script supports a tiny subset of markdown, rendered by <PresenterNote>:
 *   - blank-line-separated paragraphs
 *   - **bold** and *italic*
 *   - a paragraph beginning with "> " renders as a blockquote
 *
 * Sections 09, 18 and 22–26 of the script have no slide in the deck yet, so they
 * are intentionally not represented here.
 */

export type SpeakerNote = {
	/** Section header from karan-speech.md, e.g. "07 · Foundation · Centralization". */
	section: string;
	/** Spoken script for this slide (mini-markdown). */
	script: string;
	/**
	 * Optional step-keyed segments for slides whose reveals change the talking
	 * point (e.g. a slide that shows the problem at step 0 and the solution at
	 * step 1). `atStep` is the number of reveals shown when the segment becomes
	 * the one being spoken. When present, <PresenterNote> highlights the active
	 * segment and dims the rest; `script`/`section` above act as a fallback.
	 */
	segments?: { atStep: number; section: string; script: string }[];
};

export const speakerNotes = {
	title: {
		section: "01 · AI Engineer · Breakout",
		script: `I'm Karan, co-founder and CTO of Composio.`,
	},
	toolCalls: {
		section: "01 · AI Engineer · Breakout",
		script: `Most agentic tool calls today are still happening in one place: software engineering. Every other kind of work is trailing far behind.

If models keep getting better, why is the power of agents still stuck in coding? That's the trillion-dollar question, and I'm here to answer it.`,
	},
	codingArc: {
		section: "02 · Where we are",
		script: `Three years ago, coding agents were autocomplete. Today, software engineering is close to autonomy. We went from pressing tab, tab, tab to just letting Claude cook. That's magic.`,
	},
	dependencyTower: {
		section: "03 · Why it worked",
		script: `And why did it happen so fast? Most people think the answer is the models. And sure, the models got better, and the harnesses got better — Claude Code, Cursor, Codex. That matters, a lot. But on their own they wouldn't have gotten us here. It only worked because of all the infrastructure that software engineering already had.

Code came with the support that agents needed. You've got the repo, the full history of every change, tests, CI, code review — and if something breaks, you just revert it. We didn't have to invent any of that. It already existed, allowing agents to build on it.`,
	},
	emptyTower: {
		section: "05 · What's happening now",
		script: `Now we're pointing those same agents at everything else — sales, support, marketing, you name it. But the agent that's so fluent in code is suddenly working blind, because the infrastructure it was leaning on just doesn't exist in other fields.`,
	},
	bridge: {
		section: "06 · The question",
		script: `So how do we close that gap between coding agents and knowledge-work agents?

We think it comes down to six primitives. Coding got all six of them for free, and knowledge work has none. So that's what we have to build.

First is centralization.`,
	},
	codebaseBento: {
		section: "07 · Foundation · Centralization",
		script: `Coding agents work so well partly because they're right next to the source of truth. They have the what, the why, and the how. You give them the repo, the infrastructure as code, you close the loop, and you let them cook. The agent starts with everything that it needs in one place.`,
	},
	knowledgeFragments: {
		section: "08 · Foundation · Centralization",
		script: `This is exactly what knowledge work doesn't have. A single deal is scattered across five different platforms. The record is in Salesforce, the docs are in Notion, the conversations are in Slack, the emails are in Gmail, and the support history's in Zendesk. There's no source of truth, no single place to look. Everything's separate, and every app has its own login. Before a knowledge-work agent can even start to do anything, it has to go and pull all of that together itself. And that's just to reach the starting line where a coding agent begins by default. Getting from there to what code can actually do? That's near impossible.`,
		segments: [
			{
				atStep: 0,
				section: "08 · Foundation · Centralization",
				script: `This is exactly what knowledge work doesn't have. A single deal is scattered across five different platforms. The record is in Salesforce, the docs are in Notion, the conversations are in Slack, the emails are in Gmail, and the support history's in Zendesk. There's no source of truth, no single place to look. Everything's separate, and every app has its own login. Before a knowledge-work agent can even start to do anything, it has to go and pull all of that together itself. And that's just to reach the starting line where a coding agent begins by default. Getting from there to what code can actually do? That's near impossible.`,
			},
			{
				atStep: 1,
				section: "09 · Build · Centralization",
				script: `So the first thing we build is that missing center. One place where all your apps, all your connections, all the logins live together — so the agent isn't stitching fifty tools together before even beginning to work. It starts with everything already in reach, the same way a coding agent starts with the repo. And you decide exactly what each agent can touch, and what it can't. That's the foundation we can build on top of.`,
			},
		],
	},
	historyBridge: {
		section: "10 · Foundation · History",
		script: `The next thing the agent needs: a sense of history — the ability to look back.`,
	},
	gitHistory: {
		section: "10 · Foundation · History",
		script: `In code, you get it for free. Git keeps a record of every change ever made. So the agent can always look back and ask: how did we get here? What did we try before that worked, and what didn't?

Think about the kind of thing you actually ask an agent:

> "We had to revert this change once, and it was a pain to pull off. Go find how we did it last time, and do that again."

It just reads the history and does it.

The history isn't just for the agent — it's for you too. You can see what your agent did, and what it didn't, so nothing is hidden. You don't have to take its word for anything; you can just go check. That's how you learn to trust it.`,
	},
	knowledgeHistoryGap: {
		section: "11 · Foundation · History",
		script: `Now ask those same questions about knowledge work. What led the CRM to look the way it does today? How did my colleague write that one email that closed the deal? What's the actual process to escalate a support issue — or close it out? The answers are smeared across a hundred different apps, and not one of them keeps the history.

So the agent has no memory. It starts from zero every single time — no idea what was tried before, what worked, or what blew up.

And you have nothing to look at either. Once the agent runs, you can't actually see what it did. There's no way to know if it got it right, and no real reason to trust it.

That's what's missing: a record of the work.`,
	},
	eventLog: {
		section: "12 · Build · Observability",
		script: `Now, because everything finally runs through one place, we can build the next piece on top of it — the record. For the first time there's a single log of every action every agent takes, across every app: what it touched, what it skipped, what worked and what didn't.

First, the agent gets memory. It can look back at how similar tasks went before and repeat what worked, instead of starting from zero — so it gets better the more it runs.

Second, you get trust. You can finally see exactly what your agent did. So, instead of hoping it did the right thing, you can go check, and catch it if it got something wrong. And the more you see it get things right, the more willing you'll be to hand it tasks.`,
	},
	contextBridge: {
		section: "13 · Foundation · Context",
		script: `The next thing an agent needs is context. And there are really two kinds.`,
	},
	contextInCode: {
		section: "13 · Foundation · Context",
		script: `The first is the shape of the system, the architecture — how everything fits together. What connects to what, where the data flows, which piece you can't change without breaking three others. It's the map a senior engineer keeps in their head, the one that takes a new hire three months to understand.

The second is the style. This isn't what's objectively correct, but what's yours. Maybe your team uses decorators in TypeScript where nobody else would. It's not written down in any spec; it's just how you like to do things.

In code, the agent gets both of these for free. It's all sitting in the repo — the structure and the style, baked right into the code. The agent reads through it and just picks it up; nobody has to write any of it down or explain it.`,
	},
	contextInKnowledgeWork: {
		section: "14 · Foundation · Context",
		script: `It's different for knowledge agents. The problem shows up when it tries to do anything real.

Say you're writing a doc for a customer. To even start, I'd open the database to pull their usage, check PostHog for how they've actually been using the product, and look at Salesforce for where the deal stands. Only then can I write the first line.

The answer wasn't isolated in just one of those tools. I'm able to write the doc because of context I've gathered across the three platforms. And that's the part the agent can't get.

Put history and context together, and you get how the organization really works — and that's the part an agent just can't figure out on its own.`,
	},
	contextRecord: {
		section: "15 · Build · Context",
		script: `That record we just built — the one that gives the agent memory and lets you check what it did — does one more thing. Log enough of what every agent does, and you start to see how the work actually gets done. That's context.

Once every action is written down, patterns surface. You can see how tools actually get used here — which approaches work, and which ones quietly fail. The record isn't just a history of what happened anymore; it's a picture of how your company really works.

And it works at three levels. How a tool works in general — true for everyone. How your company does it. And how you, personally, do it. The agent reads whichever level it needs.

And that's the context that was missing — both halves of it. How the work actually gets done: the real steps your team follows, not the ones in some playbook. And how your team likes it done: the preferences nobody ever wrote down. Give the agent that, and it stops guessing how your company works. It just knows.`,
	},
	verificationBridge: {
		section: "16 · Controls · Verification",
		script: `The other reason coding agents work so well: the work checks itself.`,
	},
	verificationInCode: {
		section: "16 · Controls · Verification",
		script: `The moment the agent writes code, a stack of checks are already waiting. The unit tests catch the small mistakes. The integration tests catch the ones that only affect components three modules away. The type system wipes out whole classes of bugs before the code ever runs. And the compiler is the final gate — it either builds, or it doesn't.

On top of it sits softer checks — linters, formatters, Bugbot.md, review skills — and these ensure that the code matches the way your team actually does things.

None of it needs you. The agent completes its own loop and verifies its own work.`,
	},
	verificationInKnowledgeWork: {
		section: "17 · Controls · Verification",
		script: `A while back I pointed my Openclaw at hiring outreach. Mass emails to candidates. It ran, it sent, it did exactly what I told it to.

It was also a disaster. The kind that ends up on Twitter, with my name on it.

And here's the thing — every check from the last slide would have passed. The emails were valid. The addresses were real. It compiled, basically. There was no test in the world for the question that actually mattered: *should this have gone out at all?*

That's the gap. In code, something tells you when you're wrong. Here, the internet had to tell me I was wrong.`,
	},
	verificationSolution: {
		section: "18 · Build · Verification",
		script: `So we build the check that was missing.

The problem in the above thread wasn't the outreach was wrong — it was that it went out before anyone could tell. So the fix is simple: catch it before it's real.

Two ways we do that. One — before the agent sends anything, it checks the draft against emails you've actually sent before. Is this one as good as those? That's the goodness test that didn't exist before.

Two — for anything destructive, it doesn't touch the real world first. It runs against a sandbox with mock data, as many times as it needs, and watches what would happen. The blast radius lands on a copy, not on your candidates.

Put those two together, and you've got something knowledge work never had — a way for the agent to check its own work before it's real. It can finally close its own loop, instead of stopping to wait for you. And that's what lets you trust it to act — without`,
	},
	governanceBridge: {
		section: "19 · Trust · Governance",
		script: `Next thing, the agent needs is governance. Building trust is controlling what the agent can touch in the first place.`,
	},
	governanceInCode: {
		section: "19 · Trust · Governance",
		script: `In code, this is mostly solved, and it works in layers. The agent can do whatever it wants on a branch, but it can't merge to main — a human always stands between the mess and anything real. The critical files have code owners, so the moment it touches one, the right person gets pulled in. We use these agents to ship to preview, never production — this allows us to use them more confidently.

That's governance: not one gate, but a stack of them, each sized to how much damage is possible. None of it slows the agent down on the safe stuff — it just draws hard lines around the parts that matter. And the tighter those lines are, the more you trust it, and the more you hand off.`,
	},
	governanceInKnowledgeWork: {
		section: "20 · Trust · Governance",
		script: `You probably saw this one. The director of alignment at Meta Super Intelligence hooked an agent up to her email, and it started deleting things. She told it to stop — it kept going. She had to run to another machine to physically kill it. Two hundred emails gone.

She'd told it to confirm before acting. But that was just a prompt, and under load the agent lost it. If someone who does AI alignment for a living can't hold an agent back with instructions, none of us can.

And that's the real reason these agents are so hard to trust — not because they're worse than your coding agents, but because there's no wall around them. In code, the wall is built into the system; the agent can't argue with it or forget it. Knowledge work has nothing like that. A few pieces exist — Gmail limits who you can email, Salesforce has permission levels — but they're scattered across fifty tools that don't talk to each other. So the only real control left is you, asking the agent to behave and hoping it listens.

And an agent will always find the gap between a prompt and a real boundary — under load, at scale, on the one path nobody thought to fence off. That's how 200 emails vanish.

So what would have actually stopped it? Not a better instruction. A wall it couldn't cross — even if it forgot why the wall was there.`,
	},
	governanceSolution: {
		section: "21 · Build · Governance",
		script: `So we build the wall that was missing — in two layers.

The first is deterministic: control over what each agent can even reach. Which tools, which scopes, nothing more. A hiring agent gets the inbox but read-only; a support agent can draft but never send. The boundary lives outside the agent — it can't be argued with, compacted away, or forgotten under load. Yue's instruction failed because it lived in the agent's memory. This doesn't.

But access alone wouldn't have saved her. Her agent *needed* email access — that was the job. The damage was what it did with access it was allowed to have.

So the second layer is policy in plain language. "Never delete more than ten records at once." "Never email outside our domain." Rules about behavior, not just access — enforced before the action goes through.

One layer controls what the agent can reach. The other controls what it can do once it's there. Together, that's real governance — not asking the agent to behave, but enforcing it, whether it remembers to or not.`,
	},
} satisfies Record<string, SpeakerNote>;

export type SpeakerNoteKey = keyof typeof speakerNotes;
