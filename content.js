// Everything you are likely to change on the page is in this file. See README.md.
window.SITE = {
  title: "ReciReflect",
  eyebrow: "Demo paper · Interactive companion",
  tagline: "Transparent, agentic food recommendation",
  intro: "ReciReflect recommends recipes from about 9,600 food.com dishes, ranked by what each person values. " +
         "A supervisor agent watches for drift between what people say and what they do, and asks before anything changes.",

  // Paste the address of your running demo here. While it is empty, the demo button stays hidden.
  demoUrl: "https://fip-195-148-23-242.kaj.poutavm.fi/",
  repoUrl: "https://github.com/AmirMohammad-Nouri/ReciReflect",

  principle: "The agent manages the learning process; it does not pick the food.",
  principleDetail: "Ranking is done by a deterministic multi-criteria engine you can audit. The language model only " +
                   "classifies messages, chooses among fixed options and phrases answers.",

  // A video is either a file in media/videos ({ file, poster, captions }) or a YouTube video ({ youtube: "VIDEO_ID" }).
  videos: [
    {
      title: "ReciReflect in action: Sara's week",
      description: "A narrated walkthrough (about 8 minutes) with a fictional user: the parts of the app, the moment each supervisor threshold is reached, and the Config page. The voice is computer-generated; turn on captions with the CC button.",
      file: "media/videos/walkthrough.mp4",
      poster: "media/videos/walkthrough-poster.webp",
      captions: "media/videos/walkthrough.vtt",
    },
    // { title: "Talk about the project", description: "", youtube: "VIDEO_ID" },
  ],

  // Shown in this order. To add one: put the image in media/screens and add a line.
  // Each screen of the app tour. `notes` are numbered hotspots: x and y are percentages of the image.
  screenshots: [
    { file: "discover.webp", title: "Discover", text: "Five dishes ranked by your own values.", notes: [
      { x: 51.5, y: 41, title: "Health grade", text: "A to E, calculated for the health goal this person chose." },
      { x: 41, y: 46, title: "Three value scores", text: "Healthiness, sustainability and convenience, each from 0 to 1." },
      { x: 60, y: 51.5, title: "A plain-language reason", text: "Each dish says why it was suggested." },
      { x: 34, y: 55, title: "Reactions that teach", text: "Like, save, cook or reject. Reasons become evidence for the supervisor." },
    ] },
    { file: "score-breakdown.webp", title: "How it's scored", text: "Every number can be opened and audited.", notes: [
      { x: 94.5, y: 45.5, title: "Similarity score", text: "The value that orders the list." },
      { x: 60, y: 69, title: "Weight × score", text: "Each criterion's contribution to the score." },
      { x: 8.5, y: 87, title: "Down to the nutrients", text: "Each score can be traced to the factors behind it." },
    ] },
    { file: "chat-explain.webp", title: "Ask why", text: "The assistant answers from recorded evidence.", notes: [
      { x: 70, y: 25, title: "Every step is recorded", text: "Open the trace to see the steps and the tools used." },
      { x: 69.6, y: 40, title: "Numbers from the engine", text: "Facts come from the ranking engine, not from a language model." },
      { x: 69.6, y: 51, title: "It says what is uncertain", text: "Estimates are named as estimates." },
    ] },
    { file: "chat-what-if.webp", title: "Try a what-if", text: "See how the list would change if priorities shifted. Nothing is saved.", notes: [] },
    { file: "supervisor.webp", title: "The supervisor asks", text: "When choices drift from the saved goal, it asks first.", notes: [
      { x: 90.5, y: 8.6, title: "A waiting question", text: "A badge shows that the supervisor has something to ask." },
      { x: 69.6, y: 22, title: "A trade-off question", text: "Which value usually wins when two of them conflict?" },
      { x: 69.6, y: 31, title: "It explains itself", text: "What it noticed, and what each answer will do." },
      { x: 69.6, y: 42, title: "The person decides", text: "None of these answers edits the saved goal." },
    ] },
    { file: "chat-options.webp", title: "Choose a new goal", text: "Goal changes come as options with their resulting lists. Nothing changes until you pick one.", notes: [] },
    { file: "insights.webp", title: "Insights", text: "What you said you value, next to what your choices show.", notes: [
      { x: 6, y: 26, title: "Preference match", text: "How closely choices follow the values that were set." },
      { x: 55, y: 48, title: "Said versus done", text: "Stated and observed weights, value by value." },
      { x: 93.5, y: 76.8, title: "The gap", text: "This is the number the supervisor's thresholds watch." },
      { x: 69, y: 79, title: "The rule, in plain sight", text: "The page states when the supervisor will act." },
    ] },
    { file: "knowledge-graph.webp", title: "Knowledge graph", text: "The structured history the supervisor retrieves its evidence from.", notes: [
      { x: 34.4, y: 73.4, title: "The person", text: "Goals, rules, lists and choices connect back to the user." },
      { x: 22.6, y: 76, title: "Declared rules", text: "A declared allergy is a node too." },
      { x: 43, y: 39.7, title: "The whole catalogue", text: "Recipes, ingredients and events in one graph." },
      { x: 75, y: 40.5, title: "Search and expand", text: "Find any node and open its neighbours." },
    ] },
    { file: "values.webp", title: "Values and diversity", text: "Set how much each value counts. Each saved goal becomes a version you can restore.", notes: [] },
    { file: "onboarding.webp", title: "Onboarding", text: "Allergies and diets are set first, as rules applied before ranking.", notes: [] },
    { file: "config-admin.webp", title: "Config page", text: "Administrators set the model, criteria, access roles and study population.", notes: [] },
    { file: "dark-mode.webp", title: "Dark theme", text: "The whole app also comes in a dark theme.", notes: [] },
  ],
  screenshotNote: "Captured from the app's demo mode with no language model connected, so answers use the built-in rules and templates. With a model, the wording differs.",

  // Times are in seconds from the start of the video.
  chapters: [
    { at: 0, title: "Introduction" },
    { at: 29, title: "Sign-in and setup" },
    { at: 88, title: "Recommendations" },
    { at: 116, title: "The assistant" },
    { at: 149, title: "A busy week begins" },
    { at: 197, title: "First threshold: a question" },
    { at: 234, title: "The waiting period" },
    { at: 256, title: "Second threshold: a proposal" },
    { at: 305, title: "Insights and evidence" },
    { at: 333, title: "The Config page" },
    { at: 372, title: "Supervisor thresholds" },
    { at: 456, title: "Summary" },
  ],

  features: [
    { title: "Multi-criteria ranking", text: "Healthiness, sustainability and convenience by default, plus a learned share for taste. Allergies and diets are mandatory rules." },
    { title: "An inspectable agent", text: "Every step is shown live. Works with Ollama, any OpenAI-compatible API or the Claude API, and with no model at all." },
    { title: "Configurable", text: "The model, dataset, criteria, feedback options, roles and study population live in one file or on the Config page." },
    { title: "Built for studies", text: "Generated participant accounts, a standard export for analysis, and scripted scenarios for reproducible tests." },
  ],

  install: [
    "git clone https://github.com/AmirMohammad-Nouri/ReciReflect.git",
    "cd ReciReflect",
    "python3 -m venv .venv && source .venv/bin/activate",
    "pip install -e .",
    "foodrec admin password   # choose the administrator's password",
    "foodrec                  # opens http://127.0.0.1:8000",
  ],
};
