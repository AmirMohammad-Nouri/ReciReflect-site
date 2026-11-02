// Everything you are likely to change on the page is in this file. See README.md.
window.SITE = {
  title: "FoodRec",
  tagline: "Transparent, agentic food recommendation",
  intro: "FoodRec recommends recipes from about 9,600 food.com dishes, ranked by what each person values. " +
         "A supervisor agent watches for drift between what people say and what they do, and asks before anything changes.",

  // Paste the address of your running demo here. While it is empty, the demo button stays hidden.
  demoUrl: "",
  repoUrl: "https://github.com/AmirMohammad-Nouri/agentic_recom_sys",

  principle: "The agent manages the learning process; it does not pick the food.",
  principleDetail: "Ranking is done by a deterministic multi-criteria engine you can audit. The language model only " +
                   "classifies messages, chooses among fixed options and phrases answers.",

  // A video is either a file in media/videos ({ file, poster }) or a YouTube video ({ youtube: "VIDEO_ID" }).
  videos: [
    {
      title: "A walk through the app",
      description: "Onboarding, recommendations, score details, the assistant, a supervisor question and the admin Config page. No sound; captions explain each step.",
      file: "media/videos/walkthrough.webm",
      poster: "media/videos/walkthrough-poster.webp",
    },
    // { title: "Talk about the project", description: "", youtube: "VIDEO_ID" },
  ],

  // Shown in this order. To add one: put the image in media/screens and add a line.
  screenshots: [
    { file: "discover.webp", title: "Discover", text: "Five dishes ranked by your own values, each with a health grade and a reason in plain words." },
    { file: "score-breakdown.webp", title: "How it's scored", text: "Open any dish to see each criterion, its weight and how the score was calculated." },
    { file: "chat-explain.webp", title: "Ask why", text: "The assistant answers from recorded evidence and shows the steps it took." },
    { file: "chat-what-if.webp", title: "Try a what-if", text: "See how the list would change if your priorities shifted. Nothing is saved." },
    { file: "supervisor.webp", title: "The supervisor asks", text: "When choices drift from the saved goal, it asks a question and gives the evidence." },
    { file: "chat-options.webp", title: "Choose a new goal", text: "Goal changes come as options with their resulting lists. Nothing changes until you pick one." },
    { file: "insights.webp", title: "Insights", text: "What you said you value, next to what your choices show." },
    { file: "knowledge-graph.webp", title: "Knowledge graph", text: "The structured history the supervisor retrieves its evidence from." },
    { file: "values.webp", title: "Values and diversity", text: "Set how much each value counts. Each saved goal becomes a version you can restore." },
    { file: "onboarding.webp", title: "Onboarding", text: "Allergies and diets are strict rules, applied before anything is ranked." },
    { file: "config-admin.webp", title: "Config page", text: "Administrators set the model, criteria, access roles and study population." },
    { file: "dark-mode.webp", title: "Dark theme", text: "The whole app also comes in a dark theme." },
  ],
  screenshotNote: "Captured from the app's demo mode with no language model connected, so answers use the built-in rules and templates. With a model, the wording differs.",

  features: [
    { title: "Multi-criteria ranking", text: "Healthiness, sustainability and convenience by default, plus a learned share for taste. Allergies and diets are mandatory rules." },
    { title: "An inspectable agent", text: "Every step is shown live. Works with Ollama, any OpenAI-compatible API or the Claude API, and with no model at all." },
    { title: "Configurable", text: "The model, dataset, criteria, feedback options, roles and study population live in one file or on the Config page." },
    { title: "Built for studies", text: "Generated participant accounts, a standard export for analysis, and scripted scenarios for reproducible tests." },
  ],

  install: [
    "git clone https://github.com/AmirMohammad-Nouri/agentic_recom_sys.git",
    "cd agentic_recom_sys",
    "python3 -m venv .venv && source .venv/bin/activate",
    "pip install -e .",
    "foodrec admin password   # choose the administrator's password",
    "foodrec                  # opens http://127.0.0.1:8000",
  ],
};
