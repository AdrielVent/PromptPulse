export type PostType =
  | "Dashboard"
  | "Digital twin"
  | "Student utility"
  | "Robotics demo"
  | "Backend / platform"
  | "AI analytics"
  | "Developer tool"
  | "Resource drop";

export type Difficulty = "Approachable" | "Intermediate" | "Advanced";

export interface PromptedPost {
  id: string;
  title: string;
  category: string;
  postType: PostType;
  tools: string[];
  likes: number;
  comments: number;
  timeSpent?: string;
  excerpt: string;
  patterns: string[];
  founderRelevance: number;
  visualAppeal: number;
  usefulness: number;
}

export interface AnalyzeInput {
  title: string;
  category: string;
  tools: string;
  projectType: string;
  timeSpent?: string;
  body: string;
}

export interface ProjectDraftValidation {
  isSufficient: boolean;
  reasons: string[];
  missing: string[];
  meaningfulWordCount: number;
  detectedSignals: string[];
}

export interface AnalysisWarning {
  title: string;
  body: string;
}

export type Severity = "none" | "low" | "medium" | "high";

export interface ContaminationReport {
  hasContamination: boolean;
  contaminationTypes: string[];
  contaminatedPhrases: string[];
  severity: Severity;
  explanation: string;
}

export interface ScoreBreakdown {
  clarity: number;
  usefulness: number;
  wowFactor: number;
  commentPotential: number;
  founderAppeal: number;
  overall: number;
  status: string;
  readoutLabel: string;
  warning?: AnalysisWarning;
  validation: ProjectDraftValidation;
  contamination: ContaminationReport;
  suggestions: string[];
  strengths: string[];
  helped: string[];
  hurt: string[];
  fixes: string[];
}

export interface DashboardStats {
  totalPosts: number;
  averageLikes: number;
  averageComments: number;
  topCategories: Array<{ name: string; count: number; averageEngagement: number }>;
  topPatterns: Array<{ name: string; count: number }>;
  topPosts: Array<PromptedPost & { engagementScore: number }>;
  postTypePerformance: Array<{ label: PostType; averageScore: number; count: number }>;
}

export interface RewriteVersion {
  name: string;
  description: string;
  body: string;
}

export interface RewriteSuite {
  versions: RewriteVersion[];
  titles: string[];
  hooks: string[];
  tags: string[];
  finalPost: string;
  sanitizationNote?: string;
}

export interface ProjectIdea {
  projectName: string;
  hook: string;
  spotlightLabel?: "Best Overall" | "Most Likely to Get Comments" | "Most Useful for Prompted";
  predictedLikesRange: {
    min: number;
    max: number;
  };
  predictedCommentsRange: {
    min: number;
    max: number;
  };
  scores: {
    founderAppeal: number;
    builderUsefulness: number;
    visualWow: number;
    commentMagnet: number;
  };
  whyLikes: string;
  whyComments: string;
  whyPromptedCare: string;
  whyItWouldGetInteraction?: string;
  coreFeatures: string[];
  suggestedTools: string[];
  difficulty: Difficulty;
  suggestedTags: string[];
  suggestedTitle: string;
  endingQuestion: string;
  jackGrowth: string;
  buildBrief: {
    productGoal: string;
    pages: string[];
    components: string[];
    scoringLogic: string[];
    sampleData: string[];
    designDirection: string;
    exportFeatures: string[];
    readmeRequirements: string[];
  };
}
