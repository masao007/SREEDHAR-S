export type UserRole = 'worker' | 'employer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  skills: string[];
  availability: 'full-time' | 'part-time' | 'weekends' | 'evenings' | 'flexible';
  completedJobsCount: number;
  totalEarnings: number;
  avatar?: string;
  created_at: string;
}

export type JobCategory =
  | 'Delivery'
  | 'Data Entry'
  | 'Retail Assistant'
  | 'Restaurant Helper'
  | 'Event Staff'
  | 'Tutoring'
  | 'Freelance Works'
  | 'Freelance Gigs'
  | 'Remote Part-Time'
  | 'Driving'
  | 'Warehouse';

export type PayType = 'hourly' | 'daily' | 'fixed';
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_rating?: number;
  title: string;
  category: JobCategory;
  description: string;
  requirements?: string[];
  pay_amount: number;
  pay_type: PayType;
  pay_display: string; // e.g. "₹600/day"
  location_lat: number;
  location_lng: number;
  location_address: string;
  distance_km?: number;
  is_urgent: boolean;
  status: JobStatus;
  hours_per_day?: string;
  duration?: string;
  emoji: string;
  logo_bg?: string;
  tags: string[];
  created_at: string;
  aiMatchScore?: number;
  aiMatchReason?: string;
}

export type ApplicationStatus = 'applied' | 'accepted' | 'rejected' | 'completed';

export interface Application {
  id: string;
  job_id: string;
  job_title: string;
  job_category: JobCategory;
  worker_id: string;
  worker_name: string;
  worker_phone: string;
  worker_rating: number;
  status: ApplicationStatus;
  applied_at: string;
  message?: string;
  pay_amount: number;
  pay_type: PayType;
}

export interface EarningRecord {
  id: string;
  worker_id: string;
  job_id: string;
  job_title: string;
  category: JobCategory;
  amount: number;
  payout_status: 'pending' | 'processed';
  payout_date: string;
  payment_method?: string;
  transaction_ref?: string;
}

export interface MonthlyEarningsStat {
  month: string;
  amount: number;
  jobsCount: number;
  isPeak?: boolean;
}

export interface EarningsSummary {
  totalEarned: number;
  currentMonthEarned: number;
  bestMonthLabel: string;
  monthGrowthPercentage: number;
  completedJobsCount: number;
  averageRating: number;
  referralBonus: number;
  monthlyStats: MonthlyEarningsStat[];
  recentPayouts: EarningRecord[];
  categoryBreakdown: { category: string; amount: number }[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  message: string;
  title?: string;
  type: 'job_alert' | 'application_update' | 'payout' | 'referral' | 'system';
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
  time?: string;
  action_url?: string;
}

export type Notification = AppNotification;

export interface AIMatchResult {
  jobId: string;
  matchScore: number;
  fitSummary: string;
  matchedSkills: string[];
  recommendationNote: string;
}

export interface AIWorkerMatchResponse {
  topMatches: AIMatchResult[];
  profileAdvice: string;
  suggestedEarningsPotential: string;
}
