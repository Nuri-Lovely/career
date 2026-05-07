export interface Subject {
  id: string;
  name_kk: string;
  description_kk: string;
  icon: string;
  category: string;
}

export interface Career {
  id: string;
  title_kk: string;
  summary_kk: string;
  technical_skills: string[];
  soft_skills: string[];
  image_url?: string;
  mentor_name?: string;
  mentor_location?: string;
}

export interface RoadmapStep {
  title: string;
  action: string;
  resource?: string;
}

export interface Roadmap {
  high_school: RoadmapStep;
  university: RoadmapStep;
  self_study: RoadmapStep;
}

export interface SimulationScenario {
  question: string;
  options: {
    label: string;
    description: string;
    outcome: string;
  }[];
}

export interface BridgeResult {
  id: string;
  career_id?: string;
  selected_subjects: string[];
  selected_hobby: string;
  selected_traits: string[];
  career: Career;
  ai_explanation: string;
  ai_roadmap: Roadmap;
  ai_simulation: SimulationScenario;
  ai_project_starter: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description: string;
  link?: string;
  project_type: string;
  created_at: string;
}
