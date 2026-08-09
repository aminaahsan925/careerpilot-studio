import { useQuery } from "@tanstack/react-query";

import heroPerson from "@/assets/hero-person.png";
import planPortrait from "@/assets/plan-portrait.png";

export type Score = {
  label: string;
  value: number;
  max: number;
  note: string;
  trend: number[];
};

export type Application = {
  company: string;
  role: string;
  status: "Under Review" | "Applied" | "Interview Scheduled" | "Offer";
  initials: string;
};

export type Skill = { name: string; level: number };

export type PlanItem = { id: string; label: string; done: boolean };

export type RoadmapStep = {
  title: string;
  meta: string;
  state: "Active" | "In Progress" | "Upcoming" | "Completed";
  progress: number;
};

export type CareerUser = {
  firstName: string;
  fullName: string;
  role: string;
  avatar: string;
  heroImage: string;
  planImage: string;
  goal: string;
  goalProgress: number;
  planDate: { day: string; month: string };
  scores: Score[];
  plan: PlanItem[];
  roadmap: RoadmapStep[];
  applications: Application[];
  skills: Skill[];
};

const currentUser: CareerUser = {
  firstName: "Ali",
  fullName: "Ali Raza",
  role: "CS Student",
  avatar: planPortrait,
  heroImage: heroPerson,
  planImage: planPortrait,
  goal: "Full Stack Developer",
  goalProgress: 65,
  planDate: { day: "08", month: "May, 2026" },
  scores: [
    {
      label: "Career Score",
      value: 82,
      max: 100,
      note: "12% this month",
      trend: [28, 34, 30, 44, 38, 52, 48, 66, 62, 78, 84],
    },
    {
      label: "Resume Score",
      value: 88,
      max: 100,
      note: "Great Job!",
      trend: [20, 30, 26, 42, 46, 40, 58, 66, 72, 80, 88],
    },
    {
      label: "Interview Score",
      value: 76,
      max: 100,
      note: "Keep Practicing",
      trend: [30, 26, 40, 34, 50, 44, 58, 54, 68, 64, 76],
    },
    {
      label: "Skills Matched",
      value: 24,
      max: 30,
      note: "Keep Learning",
      trend: [18, 24, 22, 32, 40, 36, 50, 58, 54, 70, 76],
    },
  ],
  plan: [
    { id: "sql", label: "Complete SQL Course", done: true },
    { id: "intern", label: "Apply to 5 Internships", done: true },
    { id: "linkedin", label: "Update LinkedIn Profile", done: false },
    { id: "interview", label: "Practice Interview", done: false },
  ],
  roadmap: [
    { title: "Full Stack Developer", meta: "12 weeks • Intermediate", state: "Active", progress: 65 },
    { title: "Next.js & React", meta: "4 weeks • Advanced", state: "In Progress", progress: 45 },
    { title: "Node.js & Express", meta: "3 weeks • Intermediate", state: "Upcoming", progress: 0 },
    { title: "MongoDB Basics", meta: "2 weeks • Beginner", state: "Upcoming", progress: 0 },
  ],
  applications: [
    { company: "Systems Limited", role: "Software Engineer Intern", status: "Under Review", initials: "SL" },
    { company: "Netsol", role: "Frontend Developer Intern", status: "Applied", initials: "NS" },
    { company: "Contour Software", role: "Backend Developer Intern", status: "Interview Scheduled", initials: "C" },
  ],
  skills: [
    { name: "Python", level: 90 },
    { name: "SQL", level: 80 },
    { name: "JavaScript", level: 70 },
    { name: "Communication", level: 60 },
    { name: "Problem Solving", level: 85 },
  ],
};

export function fetchCurrentUser(): Promise<CareerUser> {
  return Promise.resolve(currentUser);
}

export const userQueryOptions = {
  queryKey: ["current-user"],
  queryFn: fetchCurrentUser,
  staleTime: Infinity,
};

export function useCurrentUser() {
  return useQuery(userQueryOptions);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}
