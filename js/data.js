/*
 * ─────────────────────────────────────────────────────────────
 *  VINIR.OS: CONTENT FILE
 *  Everything shown on the site lives here. Edit this file to
 *  update your resume; no other code changes are needed.
 * ─────────────────────────────────────────────────────────────
 */
window.SITE = {
  name: "Vinir Rai",
  handle: "vinirrai",
  headline: "B.S.-M.S. Computer Science @ UNC Chapel Hill · Applied AI & Software Engineering",
  roles: [
    "Software Engineer",
    "Applied AI Engineer",
    "Agentic AI Developer",
    "Full-Stack Developer",
    "Graduate TA",
  ],
  location: "Chapel Hill, NC",
  playerClass: "Applied AI Engineer · Full-Stack Developer",

  // Shown under "why a game?" in the hero and in the terminal (cat about-site.txt)
  designNote: "I love games and great graphics, so I built my portfolio like one. Every part of it maps to my real experience: quests are the roles I've held, missions are projects I've built and each arcade game is inspired by my work.",

  bio: [
    "Hi, I'm Vinir! I'm an M.S. Computer Science student at UNC Chapel Hill through the accelerated B.S.-M.S. program. I serve as a Graduate TA for COMP 523: Software Engineering Laboratory. I graduated from UNC with a B.S. in Computer Science with Distinction, with minors in Data Science and South Asian Studies.",
    "I work across software engineering, data systems, applied AI and research, and I enjoy building technology that solves practical problems: a health-focused iOS app, a data analytics dashboard for AAA, a satellite tracking system, full-stack products and RAG-based assistants and agentic AI systems. I've taught and worked with students in software engineering, data science, machine learning and applied AI at UNC and BITSoM. I'm also exploring research in applied AI and NLP while serving as Chair of UNC's Student Technology Council.",
    "Outside of tech I play drums, soccer and 8-ball pool. I also love bringing people together through cultural and community events. Always happy to connect with people working on interesting problems in software, AI, NLP or research.",
  ],

  // Headline numbers shown on the player card.
  counters: [
    { value: 4, suffix: "×", label: "Dean's List" },
    { value: 4, label: "Courses supported" },
    { value: 4.4, decimals: 1, suffix: "M+", label: "Rows wrangled" },
    { value: 60, suffix: "+", label: "Residents mentored" },
  ],

  // Links. Leave a value as "" to hide it.
  links: {
    github: "https://github.com/vinirrai",
    linkedin: "https://www.linkedin.com/in/vinirrai/",
    email: "vinirrai@unc.edu",
    resume: "", // e.g. "assets/Vinir_Rai_Resume.pdf" (drop the PDF into /assets)
  },

  // Player attributes: self-rated 0 to 100. Tweak freely.
  stats: [
    { label: "AI / RAG & Agentic Systems", value: 92 },
    { label: "Python & Data Pipelines", value: 90 },
    { label: "Full-Stack Web", value: 85 },
    { label: "Statistics & Modeling", value: 80 },
    { label: "UX / Figma Prototyping", value: 75 },
    { label: "Teaching & Leadership", value: 92 },
  ],

  // Experience → "Quest Log". status: "active" | "complete"
  quests: [
    {
      title: "Graduate Teaching Assistant (COMP 523: Software Engineering Lab)",
      org: "UNC Department of Computer Science",
      where: "Chapel Hill, NC",
      dates: "Aug 2026 - Present",
      status: "active",
      xp: 2000,
      points: [
        "Graduate TA for COMP 523, supporting teams that build and deliver semester-long software products for real-world clients.",
        "Give technical guidance on software architecture, requirements engineering, API and component design, Git workflows, debugging, testing, integration and deployment.",
        "Review implementations and help teams resolve system-design, code-organization, integration and maintainability issues.",
        "Guide teams through the full lifecycle, from requirements and planning through implementation, testing, client feedback and final delivery.",
      ],
      tags: ["Software Architecture", "Code Review", "Mentoring", "SDLC"],
    },
    {
      title: "Applied AI Developer (AIBM MBA Course)",
      org: "BITSoM · BITS School of Management",
      where: "Remote",
      dates: "Jun 2026 - Jul 2026",
      status: "complete",
      xp: 1900,
      points: [
        "Built production-style starter code and infrastructure for an Applied AI course: reusable GitHub repositories and development environments for student projects.",
        "Built and maintained a RAG chatbot pipeline integrating LLM APIs, vector retrieval, document ingestion, embeddings and context-aware generation.",
        "Developed infrastructure for agentic AI projects: autonomous LLM agents, browser-based interaction, tool use, state management and multi-step task execution.",
        "Engineered and tested an agentic shopping environment with browser automation, behavioral data collection, purchase-history tracking and safeguards preventing autonomous checkout.",
        "Hardened Docker/Codespaces environments, dependency management and model-loading validation so students get reproducible setups.",
      ],
      tags: ["Agentic AI", "RAG", "LLM APIs", "Docker", "Codespaces"],
    },
    {
      title: "TA & Course Systems Developer (MBA 742 / COMP 488)",
      org: "UNC Department of Computer Science · Applied Data Science & AI",
      where: "Chapel Hill, NC",
      dates: "Jan 2026 - May 2026",
      status: "complete",
      xp: 2000,
      points: [
        "Developed and maintained Carla and Nik, retrieval-augmented course assistants that answer student questions from approved slides, documents and Jupyter notebooks.",
        "Re-architected a single-path ingestion notebook into reusable PDF, notebook and text pipelines so the same RAG infrastructure serves multiple courses.",
        "Fixed a recurring citation bug with slide-aware text-to-image alignment and replaced random image-hosting URLs with deterministic, course-specific SFTP paths.",
        "Engineered the Python/Pinecone workflow: batched upserts, retries, standardized metadata, source-level deletion and stale-record checks.",
        "Coached MBA and undergraduate students on pandas, NumPy, regression, trees, random forests, clustering, RAG and model evaluation.",
      ],
      tags: ["RAG", "Pinecone", "Python", "LLMs", "Teaching"],
    },
    {
      title: "Teaching Assistant (COMP 126 / 426 Web Development)",
      org: "UNC Department of Computer Science",
      where: "Chapel Hill, NC",
      dates: "Aug 2025 - Jan 2026",
      status: "complete",
      xp: 1200,
      points: [
        "Supported live lecture demos on HTML, CSS, JavaScript, responsive layouts and accessibility-conscious design.",
        "Held office hours and one-on-one debugging sessions, adapting explanations to students with very different backgrounds.",
        "Graded assignments, gave actionable feedback and created supplemental walkthroughs.",
      ],
      tags: ["HTML/CSS/JS", "Accessibility", "Mentoring"],
    },
    {
      title: "IT Innovations Intern (Full-Stack Development)",
      org: "AAA The Auto Club Group",
      where: "Detroit, MI",
      dates: "May 2025 - Aug 2025",
      status: "complete",
      xp: 1800,
      points: [
        "Built an Angular + Chart.js analytics dashboard from the ground up, turning active-user, ratings, retention and distribution metrics into interactive KPI views used by five cross-functional teams.",
        "Partnered with UX, backend and QA to implement and debug reusable components in an agile workflow.",
        "Designed Figma prototypes for mobile, CarPlay and Android Auto experiences.",
        "Researched Generative AI, connected vehicles, AR/VR and sustainability, and presented findings to senior leadership.",
      ],
      tags: ["Angular", "Chart.js", "SCSS", "Figma", "Agile"],
    },
    {
      title: "RLP Resident Advisor (BLUE Entrepreneurship Community)",
      org: "UNC Carolina Housing",
      where: "Chapel Hill, NC",
      dates: "Jan 2025 - May 2025",
      status: "complete",
      xp: 900,
      points: [
        "Mentor and first point of contact for 60+ residents, connecting students with academic, wellness and campus resources.",
        "Planned cultural, professional-development and wellness programs for a diverse community.",
        "Handled incident documentation, conflict resolution and time-sensitive student situations with Community Directors.",
      ],
      tags: ["Leadership", "Community", "Crisis Mgmt"],
    },
    {
      title: "Undergraduate Data Analyst (University Cashier's Office)",
      org: "UNC Finance & Operations",
      where: "Chapel Hill, NC",
      dates: "Jul 2024 - Dec 2024",
      status: "complete",
      xp: 1000,
      points: [
        "Designed an Excel-based tracking and validation workflow for ~6,500 student records, helping improve inquiry-response time by 15%.",
        "Automated financial-document tracking, improving traceability and security by 34%.",
        "Answered 300+ monthly questions from students, families and campus partners.",
      ],
      tags: ["Excel", "Automation", "Data Quality"],
    },
    {
      title: "Education Team Member",
      org: "UNC CS + Social Good",
      where: "Chapel Hill, NC",
      dates: "Jan 2024 - Jun 2024",
      status: "complete",
      xp: 700,
      points: [
        "Built responsive front-end features with HTML, CSS and JavaScript through hands-on lessons and collaborative projects.",
        "Designed educational initiatives that turned technical material into approachable learning activities.",
      ],
      tags: ["Front-End", "Teaching", "Social Impact"],
    },
    {
      title: "Undergraduate Research Assistant",
      org: "UNC Kenan-Flagler Business School",
      where: "Chapel Hill, NC",
      dates: "Jul 2023 - Jan 2024",
      status: "complete",
      xp: 1400,
      points: [
        "Built Python, R and Stata pipelines to collect, clean, merge and validate 4.4M+ observations for research on corporate taxation and political donations.",
        "Applied regression, hypothesis testing and ARIMA time-series methods for Professors John Gallemore and Ed Maydew.",
      ],
      tags: ["Python", "R", "Stata", "BeautifulSoup", "Econometrics"],
    },
    {
      title: "Web Development Intern",
      org: "THE THEATÍS",
      where: "Bengaluru, India",
      dates: "May 2022 - Jul 2022",
      status: "complete",
      xp: 600,
      points: [
        "Maintained and enhanced a production website with HTML, CSS, JavaScript, API integrations and responsive design.",
        "Implemented technical and content SEO improvements that boosted search rankings and organic traffic.",
      ],
      tags: ["HTML/CSS/JS", "APIs", "SEO"],
    },
  ],

  // Projects → "Missions". category drives the filter buttons.
  missions: [
    {
      name: "CelestiaGrid",
      subtitle: "Orbital Satellite & Debris Tracker",
      badge: "Carolina Data Challenge 2025",
      description:
        "An end-to-end orbital-data platform: ingests and validates TLE records from NASA / CelesTrak and Space-Track, propagates them with Skyfield/SGP4 into daily 30-day position forecasts and renders thousands of objects on an interactive Three.js globe. Objects are color-coded by altitude band, with conjunction detection and an AI assistant you can ask 'Where is the ISS right now?'",
      tech: ["Python", "Skyfield / SGP4", "Three.js", "Satellite.js", "Vite"],
      category: ["data", "web", "ai"],
      repo: "https://github.com/vinirrai/2025-Sep-CDC-Project",
      live: "",
      icon: "🛰️",
    },
    {
      name: "Carla & Nik",
      subtitle: "RAG Course Assistants for MBA 742 / COMP 488",
      badge: "Deployed · Spring 2026",
      description:
        "Two retrieval-augmented teaching assistants that answer student questions from approved slides, documents and notebooks with trustworthy citations. Modular ingestion pipelines, slide-aware text-to-image alignment, deterministic asset paths and a Pinecone workflow with batched upserts, retries and stale-record checks.",
      tech: ["Python", "Pinecone", "RAG", "Next.js", "TypeScript", "Vercel"],
      category: ["ai", "data"],
      repo: "https://github.com/vinirrai/myTA4",
      live: "https://my-ta-4.vercel.app",
      icon: "🧠",
    },
    {
      name: "Agentic Shopping Lab",
      subtitle: "Autonomous LLM Agents for an Applied AI Course",
      badge: "BITSoM · 2026",
      description:
        "A sandboxed agentic shopping environment for MBA students: LLM agents browse, compare and add to cart through browser automation, with tool use, state management and multi-step task execution, behavioral data collection and purchase-history tracking, plus hard safeguards that stop agents from ever checking out on their own.",
      tech: ["LLM Agents", "Browser Automation", "Python", "RAG", "Docker", "Codespaces"],
      category: ["ai"],
      repo: "",
      live: "",
      icon: "🛒",
    },
    {
      name: "EstateWise",
      subtitle: "AI Real Estate Analytics Platform",
      badge: "2025",
      description:
        "A full-stack property assistant combining structured property data, vector retrieval and an expert-routing architecture to answer natural-language real-estate questions. It includes interactive analytics views, JWT auth, a Dockerized backend and GitHub to Vercel deploys.",
      tech: ["Next.js", "Express", "MongoDB", "Pinecone", "Docker", "JWT"],
      category: ["ai", "web"],
      repo: "",
      live: "",
      icon: "🏠",
    },
    {
      name: "FitSync",
      subtitle: "Personal Health & Fitness Tracker (iOS)",
      badge: "Mar - May 2025",
      description:
        "An iOS app with persistent health and activity records, live run mapping and reusable MVVM components. Integrates OpenFoodFacts barcode lookup plus location and motion services to blend external data with real-time personal metrics.",
      tech: ["SwiftUI", "SwiftData", "MapKit", "CoreLocation", "MVVM"],
      category: ["mobile"],
      repo: "",
      live: "",
      icon: "💪",
    },
    {
      name: "BetterOrgs",
      subtitle: "UNC CSXL Student-Org Discovery",
      badge: "UNC CSXL",
      description:
        "Built a compatibility score and joinability filter for UNC CSXL's student-organization discovery platform, translating organization criteria into clear interface logic so students can compare fit and eligibility.",
      tech: ["Angular", "TypeScript"],
      category: ["web"],
      repo: "",
      live: "",
      icon: "🧭",
    },
    {
      name: "StrandCast",
      subtitle: "Peer-to-Peer Video Streaming Research",
      badge: "Research",
      description:
        "An asynchronous peer-to-peer streaming prototype with designed latency, throughput and stress experiments to evaluate delivery strategies and find bottlenecks in distributed video workflows.",
      tech: ["Python asyncio", "MPEG-DASH", "Perf Testing"],
      category: ["data"],
      repo: "",
      live: "",
      icon: "📡",
    },
  ],

  // Skills → "Inventory", grouped into slots.
  inventory: {
    "Languages": ["Python", "TypeScript", "JavaScript", "SQL", "R", "Stata", "Swift", "HTML / CSS"],
    "Frameworks": ["Angular", "React", "Next.js", "Express", "FastAPI", "SwiftUI", "Three.js"],
    "Data & ML": ["pandas", "NumPy", "scikit-learn", "Jupyter", "Regression", "Clustering", "ARIMA", "Tableau"],
    "AI Systems": ["Agentic AI", "LLM Agents", "RAG", "Embeddings", "Pinecone", "OpenAI API", "Anthropic API", "Gemini", "NLP"],
    "Infra & Tools": ["Docker", "Codespaces", "Git / GitHub", "MongoDB", "REST APIs", "JWT", "Vercel", "Figma", "Chart.js"],
  },

  education: [
    {
      school: "University of North Carolina at Chapel Hill",
      degree: "M.S. in Computer Science",
      dates: "Aug 2026 - Present",
      detail: "Accelerated B.S.-M.S. program",
    },
    {
      school: "University of North Carolina at Chapel Hill",
      degree: "B.S. in Computer Science, with Distinction",
      dates: "Aug 2022 - May 2026",
      detail: "Minors: Data Science, South Asian Studies",
    },
  ],

  trophies: [
    { icon: "🏆", name: "Hall of Fame Award" },
    { icon: "📜", name: "Dean's List ×4 (Fall 2024 to Spring 2026)" },
    { icon: "🏛️", name: "Chair, UNC Student Technology Council" },
    { icon: "🎓", name: "B.S. with Distinction" },
  ],

  guilds: ["Chair · UNC Student Technology Council", "AI Impact Society", "UNC CS + Social Good"],

  hobbies: ["🥁 Drums", "⚽ Soccer", "🎱 8-ball pool", "🎉 Cultural events"],
};
