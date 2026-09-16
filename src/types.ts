export type SessionUser = {
  role: 'candidate' | 'admin'
  name: string
  id?: string
  application_state?: 'draft' | 'submitted'
}

export type Candidate = {
  id: string
  name: string
  email: string
  whatsapp: string
  age: string
  city: string
  course: string
  period: string
  area_interest: string
  technologies: string[]
  github: string
  linkedin: string
  portfolio: string
  availability: string
  learning_goals: string
  projects: string
  experience: string
  motivation: string
  answers: Record<string, string>
  status: string
  application_state: 'draft' | 'submitted'
  created_at: string
  updated_at: string
  submitted_at?: string
}

export type Note = { id: string; content: string; created_at: string }
export type Feedback = {
  id: string
  title: string
  message: string
  positives: string
  study_suggestions: string
  project_idea: string
  technologies: string
  next_steps: string
  created_at: string
}
export type Conversation = {
  id: string
  scheduled_at: string
  observations: string
  impression: string
  interests: string
  next_steps: string
}
export type StatusHistory = { id: string; status: string; created_at: string }
export type Rating = { criterion: string; score: number }
