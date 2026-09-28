// @refresh reset
import {
  createElement,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react"
import PerformaxAnimatedLogo from "./PerformaxAnimatedLogo"

type Role = "employee" | "mentor" | "hr" | "admin"
type ReviewState = "draft" | "submitted" | "published"
type ReviewCycle = {
  id: string
  name: string
  startDate: string
  endDate: string
  applicableEmployees: string[]
  eligiblePopulation: string
  status: "Draft" | "Open" | "Closed"
  publicationStatus: ReviewState
}
type TaskStatus = "Needs Action" | "In Progress" | "Upcoming" | "Completed"
type TaskPriority = "High" | "Medium" | "Low"
type EmployeeTask = {
  id: string
  name: string
  description: string
  category: "MIRAI" | "Goal" | "Team" | "Learning"
  relatedGoalId: string
  relatedGoal: string
  miraiStage?: string
  assignedBy: string
  dueDate: string
  priority: TaskPriority
  progress: number
  status: TaskStatus
}
type GoalSource = "Mentor assigned" | "Personal development"
type EmployeeGoal = {
  id: string
  title: string
  description: string
  category: string
  source: GoalSource
  assignedBy: string
  startDate: string
  dueDate: string
  priority: TaskPriority
  progress: number
  status: TaskStatus
  relatedTaskIds: string[]
  latestProgressUpdate: string
}
type MentorGoal = {
  id: string
  title: string
  description: string
  intern: string
  section: string
  initials: string
  progress: number
  status: "Upcoming" | "In progress" | "On track" | "Needs attention" | "At risk" | "Completed"
  dueDate: string
  priority: TaskPriority
  category: string
  successCriteria: string
}
type EvaluationStatus = "Draft" | "In progress" | "Ready to submit" | "Submitted to HR" | "Pending HR Review" | "Changes Requested" | "Returned by HR" | "Approved" | "Published" | "Re-review required"
type MentorEvaluation = {
  id: string
  cycleId: string
  intern: string
  section: string
  initials: string
  mentor: string
  status: EvaluationStatus
  rating: string
  overallFeedback: string
  strengths: string
  areasForImprovement: string
  developmentRecommendations: string
}

const initialEmployeeTasks: EmployeeTask[] = [
  {
    id: "midpoint-reflection",
    name: "Complete midpoint reflection",
    description:
      "Reflect on your Q3 progress, learning, and the support you need for the remainder of the stage.",
    category: "MIRAI",
    relatedGoalId: "facilitation-confidence",
    relatedGoal: "Strengthen facilitation confidence",
    miraiStage: "Q3 · Rise",
    assignedBy: "Daniel Ortiz",
    dueDate: "Sep 18",
    priority: "High",
    progress: 20,
    status: "Needs Action",
  },
  {
    id: "onboarding-interviews",
    name: "Synthesize onboarding interviews",
    description:
      "Consolidate interview notes into themes and recommended improvements for the onboarding experience.",
    category: "Goal",
    relatedGoalId: "onboarding-research",
    relatedGoal: "Improve onboarding research quality",
    assignedBy: "Daniel Ortiz",
    dueDate: "Sep 20",
    priority: "High",
    progress: 80,
    status: "In Progress",
  },
  {
    id: "mobile-critique",
    name: "Prepare mobile launch critique",
    description:
      "Review the mobile beta experience and prepare prioritized feedback for the product critique.",
    category: "Team",
    relatedGoalId: "mobile-launch",
    relatedGoal: "Contribute to mobile product launch",
    assignedBy: "Maya Chen",
    dueDate: "Sep 24",
    priority: "Medium",
    progress: 40,
    status: "In Progress",
  },
  {
    id: "accessibility-module",
    name: "Complete accessibility module",
    description:
      "Finish the assigned accessibility learning module and record key practices for future project work.",
    category: "Learning",
    relatedGoalId: "design-system-fluency",
    relatedGoal: "Build design system fluency",
    miraiStage: "Q3 · Rise",
    assignedBy: "Learning & Development",
    dueDate: "Sep 28",
    priority: "Low",
    progress: 25,
    status: "Upcoming",
  },
]

const initialEmployeeGoals: EmployeeGoal[] = [
  {
    id: "onboarding-research",
    title: "Improve onboarding research quality",
    description:
      "Raise the quality and clarity of onboarding insights through structured interviews and evidence-led synthesis.",
    category: "Customer insight",
    source: "Mentor assigned",
    assignedBy: "Daniel Ortiz",
    startDate: "Jul 1, 2025",
    dueDate: "Sep 30, 2025",
    priority: "High",
    progress: 76,
    status: "Needs Action",
    relatedTaskIds: ["onboarding-interviews"],
    latestProgressUpdate: "Interview synthesis is underway.",
  },
  {
    id: "design-system-fluency",
    title: "Build design system fluency",
    description:
      "Develop practical fluency in accessible patterns, reusable components, and consistent interface decisions.",
    category: "Capability",
    source: "Mentor assigned",
    assignedBy: "Daniel Ortiz",
    startDate: "Jul 1, 2025",
    dueDate: "Oct 15, 2025",
    priority: "Medium",
    progress: 58,
    status: "In Progress",
    relatedTaskIds: ["accessibility-module"],
    latestProgressUpdate: "Completed two of four learning modules.",
  },
  {
    id: "mobile-launch",
    title: "Contribute to mobile product launch",
    description:
      "Support launch quality through design critique, usability feedback, and cross-functional collaboration.",
    category: "Business impact",
    source: "Mentor assigned",
    assignedBy: "Daniel Ortiz",
    startDate: "Aug 1, 2025",
    dueDate: "Oct 31, 2025",
    priority: "High",
    progress: 43,
    status: "In Progress",
    relatedTaskIds: ["mobile-critique"],
    latestProgressUpdate: "Mobile beta critique is being prepared.",
  },
  {
    id: "facilitation-confidence",
    title: "Strengthen facilitation confidence",
    description:
      "Build confidence leading structured conversations, research sessions, and collaborative team workshops.",
    category: "Development",
    source: "Personal development",
    assignedBy: "Self",
    startDate: "Sep 1, 2025",
    dueDate: "Dec 15, 2025",
    priority: "Medium",
    progress: 68,
    status: "Upcoming",
    relatedTaskIds: ["midpoint-reflection"],
    latestProgressUpdate: "Personal development goal created.",
  },
]

const initialMentorGoals: MentorGoal[] = [
  {
    id: "mentor-onboarding",
    title: "Improve customer onboarding",
    description:
      "Improve the quality of onboarding insights and recommendations.",
    intern: "Alex Morgan",
    section: "Section A · A1",
    initials: "AM",
    progress: 76,
    status: "On track",
    dueDate: "Sep 30, 2025",
    priority: "High",
    category: "Customer insight",
    successCriteria: "Deliver prioritized onboarding recommendations.",
  },
  {
    id: "mentor-mobile",
    title: "Launch mobile beta",
    description:
      "Support a high-quality mobile beta launch through critique and validation.",
    intern: "Maya Chen",
    section: "Section B · B2",
    initials: "MC",
    progress: 68,
    status: "Needs attention",
    dueDate: "Oct 15, 2025",
    priority: "High",
    category: "Business impact",
    successCriteria: "Resolve all critical beta findings.",
  },
  {
    id: "mentor-design-system",
    title: "Scale the design system",
    description:
      "Increase adoption and consistency of shared product patterns.",
    intern: "Noah Williams",
    section: "Section C · C1",
    initials: "NW",
    progress: 88,
    status: "On track",
    dueDate: "Oct 30, 2025",
    priority: "Medium",
    category: "Capability",
    successCriteria: "Publish five reusable production patterns.",
  },
  {
    id: "mentor-research",
    title: "Increase research cadence",
    description:
      "Increase the frequency and impact of customer research activities.",
    intern: "Priya Rao",
    section: "Section D · D2",
    initials: "PR",
    progress: 54,
    status: "At risk",
    dueDate: "Sep 28, 2025",
    priority: "High",
    category: "Customer insight",
    successCriteria: "Complete two research cycles each month.",
  },
]

const initialMentorEvaluations: MentorEvaluation[] = [
  {
    id: "eval-alex",
    cycleId: "cycle-midyear",
    intern: "Alex Morgan",
    section: "Section A · A1",
    initials: "AM",
    mentor: "Daniel Ortiz",
    status: "Draft",
    rating: "",
    overallFeedback: "",
    strengths: "",
    areasForImprovement: "",
    developmentRecommendations: "",
  },
  {
    id: "eval-maya",
    cycleId: "cycle-midyear",
    intern: "Maya Chen",
    section: "Section B · B2",
    initials: "MC",
    mentor: "Daniel Ortiz",
    status: "Submitted to HR",
    rating: "4.1",
    overallFeedback: "Evaluation submitted for HR review.",
    strengths: "Strong systems thinking and collaboration.",
    areasForImprovement: "Increase consistency in documenting decisions.",
    developmentRecommendations:
      "Lead one cross-functional critique next cycle.",
  },
  {
    id: "eval-noah",
    cycleId: "cycle-midyear",
    intern: "Noah Williams",
    section: "Section C · C1",
    initials: "NW",
    mentor: "Daniel Ortiz",
    status: "Ready to submit",
    rating: "4.2",
    overallFeedback:
      "Noah delivered consistent progress against assigned goals.",
    strengths: "Clear research synthesis and dependable delivery.",
    areasForImprovement: "Share findings earlier with partner teams.",
    developmentRecommendations: "Own the next quarterly research readout.",
  },
  {
    id: "eval-priya",
    cycleId: "cycle-midyear",
    intern: "Priya Rao",
    section: "Section D · D2",
    initials: "PR",
    mentor: "Daniel Ortiz",
    status: "In progress",
    rating: "",
    overallFeedback: "",
    strengths: "",
    areasForImprovement: "",
    developmentRecommendations: "",
  },
]
type AuditEvent = {
  id: string
  event: string
  person?: string
  time: string
  status: "Primary" | "Active" | "Review"
  actor: string
  role: string
  evaluationId?: string
  reason?: string
  timestamp?: string
  previousStatus?: EvaluationStatus
}
const initialAuditEvents: AuditEvent[] = [
  {
    id: "audit-role-changed",
    event: "Role changed",
    person: "Nadia Patel",
    time: "21m ago",
    status: "Primary",
    actor: "Kai Stewart",
    role: "System Admin",
  },
  {
    id: "audit-user-created",
    event: "User created",
    person: "Ava Robinson",
    time: "1h ago",
    status: "Active",
    actor: "Kai Stewart",
    role: "System Admin",
  },
  {
    id: "audit-review-accessed",
    event: "Review accessed",
    person: "Alex Morgan",
    time: "2h ago",
    status: "Active",
    actor: "Kai Stewart",
    role: "System Admin",
    evaluationId: "eval-alex",
  },
  {
    id: "audit-account-deactivated",
    event: "Account deactivated",
    time: "Yesterday",
    status: "Active",
    actor: "Nadia Patel",
    role: "HR",
  },
  {
    id: "audit-review-published",
    event: "Review published",
    person: "Leah Kim",
    time: "Yesterday",
    status: "Review",
    actor: "Nadia Patel",
    role: "HR",
    evaluationId: "eval-maya",
  },
]
type IconName = "home" | "target" | "tasks" | "journey" | "review" | "bell" | "user" | "users" | "chart" | "shield" | "settings" | "audit" | "search" | "menu" | "plus" | "arrow" | "check" | "clock" | "more" | "edit" | "close" | "logout" | "lock"

const roleMeta: Record<Role, {
  label: string
  description: string
  initials: string
}> = {
  employee: {
    label: "Employee / Intern",
    description: "Goals, tasks and MIRAI journey",
    initials: "AM",
  },
  mentor: {
    label: "Mentor",
    description: "Intern goals, progress and evaluations",
    initials: "DO",
  },
  hr: {
    label: "HR",
    description: "Review governance and publishing",
    initials: "NP",
  },
  admin: {
    label: "System Admin",
    description: "Users, access and configuration",
    initials: "KS",
  },
}

const navItems: Record<Role, { label: string icon: IconName }[]> = {
  employee: [
    { label: "Dashboard", icon: "home" },
    { label: "My Goals", icon: "target" },
    { label: "My Tasks", icon: "tasks" },
    { label: "MIRAI Journey", icon: "journey" },
    { label: "Performance Reviews", icon: "review" },
    { label: "Reminders", icon: "bell" },
    { label: "Profile", icon: "user" },
  ],
  mentor: [
    { label: "Dashboard", icon: "home" },
    { label: "My Team", icon: "users" },
    { label: "Goals", icon: "target" },
    { label: "Performance Evaluations", icon: "review" },
    { label: "Reviews", icon: "tasks" },
    { label: "Profile", icon: "user" },
  ],
  hr: [
    { label: "Dashboard", icon: "home" },
    { label: "Employees", icon: "users" },
    { label: "Performance Reviews", icon: "review" },
    { label: "Review Management", icon: "tasks" },
    { label: "Performance Overview", icon: "chart" },
    { label: "Profile", icon: "user" },
  ],
  admin: [
    { label: "Dashboard", icon: "home" },
    { label: "User Management", icon: "users" },
    { label: "Role Management", icon: "shield" },
    { label: "Access Control", icon: "lock" },
    { label: "System Settings", icon: "settings" },
    { label: "Audit Logs", icon: "audit" },
    { label: "Profile", icon: "user" },
  ],
}

const iconPaths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 10.8 12 3l9 7.8" />
      <path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3V1m0 22v-2m9-9h2M1 12h2" />
    </>
  ),
  tasks: (
    <>
      <path d="m4 7 2 2 3-4M11 7h9M4 15l2 2 3-4m2 2h9" />
    </>
  ),
  journey: (
    <>
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="6" r="2" />
      <path d="M7 18h2a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3h2" />
    </>
  ),
  review: (
    <>
      <path d="M6 3h12v18H6zM9 7h6m-6 4h6m-6 4h3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" />
      <path d="M10 21h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a3.5 3.5 0 0 1 0 6.8M17 15a5.5 5.5 0 0 1 4.5 5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2 20 5v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  audit: (
    <>
      <path d="M5 3h14v18H5zM8 7h8m-8 4h8m-8 4h5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  logout: (
    <>
      <path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
}

function Icon({
  name,
  className = "size-5",
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return createElement(
    "button",
    {
      type,
      onClick,
      disabled,
      className: `button button-${variant} ${className}`,
    },
    children,
  )
}

function TextInput(props: {
  placeholder?: string
  type?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  ariaLabel?: string
}) {
  return createElement("input", {
    type: props.type ?? "text",
    value: props.value,
    placeholder: props.placeholder,
    "aria-label": props.ariaLabel ?? props.placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      props.onChange?.(event.target.value),
    className: `field ${props.className ?? ""}`,
  })
}

function TextArea(props: {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
}) {
  return createElement("textarea", {
    value: props.value,
    placeholder: props.placeholder,
    "aria-label": props.ariaLabel ?? props.placeholder,
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
      props.onChange(event.target.value),
    className: `field min-h-28 resize-y ${props.className ?? ""}`,
  })
}

function Select({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  ariaLabel: string
}) {
  return createElement(
    "select",
    {
      value,
      "aria-label": ariaLabel,
      onChange: (event: ChangeEvent<HTMLSelectElement>) =>
        onChange(event.target.value),
      className: "field appearance-none",
    },
    children,
  )
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return createElement("input", {
    type: "checkbox",
    checked,
    onChange,
    "aria-label": label,
    className: "reminder-checkbox",
  })
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
      <div className="brand-mark" aria-hidden="true">
        <div className="relative size-4">
          <span className="absolute left-0 top-0 size-2 rounded-full bg-current" />
          <span className="absolute bottom-0 right-0 size-2 rounded-full bg-purple-400" />
        </div>
      </div>
      <div className="brand-wordmark" aria-hidden="true">
        <span className="brand-perform">Perfor</span>
        <span className="brand-max">max</span>
      </div>
    </div>
  )
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "purple" | "blue" | "green" | "amber" | "red" | "neutral"
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card ${className}`}>{children}</div>
}

function SectionTitle({
  title,
  eyebrow,
  action,
}: {
  title: string
  eyebrow?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            {eyebrow}
          </div>
        )}
        <div className="text-xl font-semibold tracking-tight text-ink">
          {title}
        </div>
      </div>
      {action}
    </div>
  )
}

function MetricCard({
  label,
  value,
  note,
  icon,
  tone = "purple",
}: {
  label: string
  value: string
  note: string
  icon: IconName
  tone?: "purple" | "blue" | "green" | "amber"
}) {
  return (
    <Card className="metric-card">
      <div className={`metric-icon metric-${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="mt-6 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-ink">{label}</div>
      <div className="mt-3 text-xs text-muted">{note}</div>
    </Card>
  )
}

function Progress({
  value,
  tone = "purple",
}: {
  value: number
  tone?: "purple" | "blue" | "green"
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
      <div
        className={`h-full rounded-full progress-${tone}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function Avatar({
  initials,
  small = false,
}: {
  initials: string
  small?: boolean
}) {
  return (
    <div
      className={`${
        small ? "size-8 text-xs" : "size-10 text-sm"
      } grid shrink-0 place-items-center rounded-full bg-neutral-900 font-semibold text-white`}
    >
      {initials}
    </div>
  )
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("employee")
  const [email, setEmail] = useState("alex.morgan@dailoqa.com")

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(34rem,0.9fr)]">
      <div className="login-panel relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-36 top-20 size-96 rounded-full border border-white/10" />
        <div className="absolute -right-20 top-36 size-64 rounded-full border border-purple-400/30" />
        <PerformaxAnimatedLogo />
        <div className="relative my-auto max-w-xl">
          <Badge tone="purple">Performance, made purposeful</Badge>
          <div className="mt-7 text-5xl font-semibold leading-tight tracking-tight">
            One place to align, grow, and do your best work.
          </div>
          <div className="mt-6 max-w-lg text-lg leading-8 text-white/60">
            Performax connects goals, feedback, and growth into a clear
            performance journey for every person.
          </div>
        </div>
        <div className="text-xs text-white/35">
          © 2025 Performax · Secure enterprise workspace
        </div>
      </div>

      <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl">
          <div className="mb-10 lg:hidden">
            <PerformaxAnimatedLogo />
          </div>
          <div className="mb-8">
            <div className="text-3xl font-semibold tracking-tight text-ink">
              Welcome back
            </div>
            <div className="mt-2 text-sm text-muted">
              Sign in to your Performance Management System
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              onLogin(role)
            }}
          >
            <div className="space-y-5">
              <label className="block">
                <span className="field-label">Email or Employee ID</span>
                <TextInput
                  value={email}
                  onChange={setEmail}
                  placeholder="name@company.com"
                />
              </label>
              <label className="block">
                <span className="field-label">Password</span>
                <TextInput
                  type="password"
                  value="performax"
                  ariaLabel="Password"
                />
              </label>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {(Object.keys(roleMeta) as Role[]).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="ghost"
                  onClick={() => setRole(item)}
                  className={`role-option ${
                    role === item ? "role-option-active" : ""
                  }`}
                >
                  <span className="text-left">
                    <span className="block text-sm font-semibold">
                      {roleMeta[item].label}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-muted">
                      {roleMeta[item].description}
                    </span>
                  </span>
                  <span
                    className={`radio-dot ${
                      role === item ? "radio-dot-active" : ""
                    }`}
                  />
                </Button>
              ))}
            </div>

            <Button type="submit" className="mt-7 w-full justify-center py-3.5">
              Sign in as {roleMeta[role].label}
              <Icon name="arrow" className="size-4" />
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-muted">
            Demo workspace · No credentials required
          </div>
        </div>
      </main>
    </div>
  )
}

function AppShell({
  role,
  active,
  setActive,
  onLogout,
  taskNotification,
  goalNotification,
  children,
}: {
  role: Role
  active: string
  setActive: (item: string) => void
  onLogout: () => void
  taskNotification?: string | null
  goalNotification?: string | null
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const names: Record<Role, { name: string title: string }> = {
    employee: { name: "Alex Morgan", title: "Product Design Intern" },
    mentor: { name: "Daniel Ortiz", title: "Product Director" },
    hr: { name: "Nadia Patel", title: "People Operations Lead" },
    admin: { name: "Kai Stewart", title: "Systems Administrator" },
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col px-4 py-6 text-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-2">
          <Brand inverse />
        </div>
        <div className="mt-10 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/35">
          Workspace
        </div>
        <nav className="mt-3 space-y-1">
          {navItems[role].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => {
                setActive(item.label)
                setMobileOpen(false)
              }}
              className={`nav-item ${
                active === item.label ? "nav-item-active" : ""
              }`}
            >
              <Icon name={item.icon} className="size-[1.1rem]" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
        <div className="sidebar-profile mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <Avatar initials={roleMeta[role].initials} small />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">
                {names[role].name}
              </div>
              <div className="mt-0.5 truncate text-[0.68rem] text-white/40">
                {names[role].title}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="app-header sticky top-0 z-20 flex h-18 items-center justify-between border-b border-border px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="icon-button lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" />
            </Button>
            <div>
              <div className="text-sm font-semibold text-ink">{active}</div>
              <div className="hidden text-xs text-muted sm:block">
                {roleMeta[role].label} workspace
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput placeholder="Search Performax" className="w-60 pl-9" />
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                className="icon-button relative"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileOpen(false)
                }}
              >
                <Icon name="bell" />
                <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-purple-600" />
              </Button>
              {notificationsOpen && (
                <Card className="notification-panel absolute right-0 top-12 z-30 p-0 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="text-sm font-semibold">Notifications</div>
                    <Badge tone="purple">
                      {role === "employee" &&
                      (taskNotification || goalNotification)
                        ? "4 new"
                        : "3 new"}
                    </Badge>
                  </div>
                  {(role === "employee"
                    ? [
                        ...(taskNotification
                          ? [
                              [
                                "Task completed",
                                `${taskNotification} was marked as completed.`,
                                "Just now",
                                "check",
                              ],
                            ]
                          : []),
                        ...(goalNotification
                          ? [
                              [
                                "Goal progress updated",
                                goalNotification,
                                "Just now",
                                "target",
                              ],
                            ]
                          : []),
                        [
                          "Performance review submitted",
                          "Your mentor’s evaluation has been submitted to HR.",
                          "2 hours ago",
                          "review",
                        ],
                        ...(!goalNotification
                          ? [
                              [
                                "Goal progress updated",
                                "Onboarding research quality moved to 76%.",
                                "Yesterday",
                                "target",
                              ],
                            ]
                          : []),
                        [
                          "Action due soon",
                          "Midpoint reflection is due Sep 18.",
                          "2 days ago",
                          "clock",
                        ],
                      ]
                    : [
                        [
                          "Workspace update",
                          "A new action requires your attention.",
                          "1 hour ago",
                          "bell",
                        ],
                        [
                          "Activity summary",
                          "Your weekly summary is ready.",
                          "Yesterday",
                          "chart",
                        ],
                      ]
                  )
                    .slice(0, 4)
                    .map((item, index) => (
                      <div
                        key={item[0]}
                        className="flex gap-3 border-b border-border px-4 py-3 last:border-0"
                      >
                        <div
                          className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                            index === 0
                              ? "bg-purple-100 text-purple-700"
                              : "bg-neutral-100 text-muted"
                          }`}
                        >
                          <Icon name={item[3] as IconName} className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink">
                            {item[0]}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-muted">
                            {item[1]}
                          </div>
                          <div className="mt-1 text-xs text-purple-600">
                            {item[2]}
                          </div>
                        </div>
                      </div>
                    ))}
                </Card>
              )}
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                className="rounded-full p-0"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationsOpen(false)
                }}
              >
                <Avatar initials={roleMeta[role].initials} small />
              </Button>
              {profileOpen && (
                <Card className="absolute right-0 top-12 z-30 w-56 p-2 shadow-xl">
                  <div className="border-b border-border px-3 py-3">
                    <div className="text-sm font-semibold">
                      {names[role].name}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {roleMeta[role].label}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="mt-1 w-full justify-start text-sm"
                  >
                    <Icon name="logout" className="size-4" /> Sign out / switch
                    role
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[96rem] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

function PageIntro({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string
  title: string
  copy: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
          {eyebrow}
        </div>
        <div className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </div>
        <div className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {copy}
        </div>
      </div>
      {action}
    </div>
  )
}

function MiraiJourney({ compact = false }: { compact?: boolean }) {
  const stages = [
    { quarter: "Q1", title: "Map", state: "complete" },
    { quarter: "Q2", title: "Immerse", state: "complete" },
    { quarter: "Q3", title: "Rise", state: "current" },
    { quarter: "Q4", title: "Advance", state: "upcoming" },
  ]
  return (
    <Card className={compact ? "" : "overflow-hidden"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="purple">MIRAI Journey</Badge>
            <span className="text-xs text-muted">FY 2025</span>
          </div>
          <div className="mt-4 text-xl font-semibold tracking-tight">
            Q3 · Rise
          </div>
          <div className="mt-1 text-sm text-muted">
            Turn feedback into focused progress.
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <div className="text-2xl font-semibold">68%</div>
          <div className="text-xs text-muted">stage progress</div>
        </div>
      </div>
      <div className="relative mt-8 grid grid-cols-4">
        <div className="absolute left-[8%] right-[8%] top-3 h-px bg-border" />
        <div className="absolute left-[8%] top-3 h-px w-[56%] bg-purple-600" />
        {stages.map((stage) => (
          <div
            key={stage.quarter}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div
              className={`grid size-6 place-items-center rounded-full border-4 border-white text-white ${
                stage.state === "complete"
                  ? "bg-purple-600"
                  : stage.state === "current"
                    ? "bg-purple-600 ring-4 ring-purple-100"
                    : "bg-neutral-200"
              }`}
            >
              {stage.state === "complete" && (
                <Icon name="check" className="size-3" />
              )}
            </div>
            <div
              className={`mt-3 text-xs font-semibold ${
                stage.state === "current" ? "text-purple-700" : "text-ink"
              }`}
            >
              {stage.quarter}
            </div>
            <div className="mt-0.5 hidden text-xs text-muted sm:block">
              {stage.title}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <Progress value={68} />
      </div>
      {!compact && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-purple-50 p-4">
          <div>
            <div className="text-sm font-semibold text-purple-950">
              Current focus
            </div>
            <div className="mt-1 text-xs text-purple-700">
              Complete your midpoint reflection by Sep 18
            </div>
          </div>
          <Button variant="secondary">
            View journey <Icon name="arrow" className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}

function MiraiDashboardJourney() {
  const stages = [
    {
      quarter: "Q1",
      title: "Map",
      state: "complete",
      status: "Completed",
      detail: "Understand role and expectations",
    },
    {
      quarter: "Q2",
      title: "Immerse",
      state: "complete",
      status: "Completed",
      detail: "Build context and capability",
    },
    {
      quarter: "Q3",
      title: "Rise",
      state: "current",
      status: "Current",
      detail: "Turn feedback into focused progress",
    },
    {
      quarter: "Q4",
      title: "Advance",
      state: "upcoming",
      status: "Upcoming",
      detail: "Apply learning and demonstrate growth",
    },
  ]

  return (
    <Card className="mirai-dashboard">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            MIRAI Journey <span className="text-muted">· FY 2025</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-xl font-semibold tracking-tight">
              Q3 · Rise
            </div>
            <Badge tone="purple">Current</Badge>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-lg font-semibold text-purple-700">68%</div>
          <div className="text-xs text-muted">stage progress</div>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mirai-track" />
        <div className="mirai-track-progress" />
        <div className="relative grid grid-cols-4">
          {stages.map((stage) => (
            <div
              key={stage.quarter}
              className={`mirai-stage mirai-stage-${stage.state}`}
              tabIndex={0}
              aria-label={`${stage.quarter} ${stage.title}, ${stage.status}`}
            >
              <div className="mirai-tooltip" role="tooltip">
                <div className="text-xs font-semibold text-ink">
                  {stage.quarter} · {stage.title}
                </div>
                <div className="mt-1 text-xs text-muted">
                  Status:{" "}
                  <span className="font-medium text-ink">{stage.status}</span>
                </div>
                {stage.state === "current" && (
                  <div className="mt-1 text-xs text-muted">
                    Progress:{" "}
                    <span className="font-medium text-purple-700">68%</span>
                  </div>
                )}
                <div className="mt-1 text-xs leading-5 text-muted">
                  Focus: {stage.detail}
                </div>
              </div>
              <div className="mirai-node">
                {stage.state === "complete" ? (
                  <Icon name="check" className="size-3" />
                ) : stage.state === "current" ? (
                  <span className="size-2 rounded-full bg-white" />
                ) : (
                  <span className="size-2 rounded-full border border-neutral-400 bg-white" />
                )}
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs font-semibold">
                  {stage.quarter} <span className="text-muted">—</span>{" "}
                  {stage.title}
                </div>
                <div
                  className={`mt-1 text-xs font-semibold uppercase tracking-wider ${
                    stage.state === "current"
                      ? "text-purple-600"
                      : stage.state === "complete"
                        ? "text-muted"
                        : "text-neutral-400"
                  }`}
                >
                  {stage.state === "complete"
                    ? "Completed"
                    : stage.state === "current"
                      ? "● Current"
                      : "Upcoming"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col justify-between gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Icon name="target" className="size-4 text-purple-600" />
          <span className="font-medium text-ink">Current focus</span>
          <span className="hidden text-muted sm:inline">·</span>
          <span className="text-muted">
            Complete your midpoint reflection by Sep 18
          </span>
        </div>
        <div className="w-full sm:w-36">
          <Progress value={68} />
        </div>
      </div>
    </Card>
  )
}

function EmployeeDashboard({
  reviewState,
  goals,
  tasks,
  setTaskCompleted,
  openProgress,
  navigate,
}: {
  reviewState: ReviewState
  goals: EmployeeGoal[]
  tasks: EmployeeTask[]
  setTaskCompleted: (taskId: string, completed: boolean) => void
  openProgress: () => void
  navigate: (page: string) => void
}) {
  const reminders = tasks.slice(0, 3)
  const completedCount = tasks.filter(
    (task) => task.status === "Completed",
  ).length

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
          Monday, 15 September
        </div>
        <div className="text-3xl font-semibold tracking-tight text-ink">
          Good morning, Alex.
        </div>
        <div className="mt-1 text-sm text-muted">
          Your Q3 priorities are moving well. One action needs your attention
          this week.
        </div>
      </div>
      <MiraiDashboardJourney />
      <div className="dashboard-commandbar mt-4">
        <div className="grid flex-1 grid-cols-2 divide-x divide-border sm:grid-cols-4">
          <CompactMetric label="Active goals" value="4" />
          <CompactMetric
            label="Tasks completed"
            value={`${8 + completedCount}/12`}
          />
          <CompactMetric label="Performance" value="On track" tone="green" />
          <CompactMetric label="Due actions" value="2" tone="amber" />
        </div>
        <Button onClick={openProgress} className="shrink-0">
          <Icon name="chart" className="size-4" /> Update progress
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">Reminders</div>
          <div className="mt-2 divide-y divide-border">
            {reminders.map((reminder) => {
              const completed = reminder.status === "Completed"
              return (
                <label
                  key={reminder.id}
                  className="flex cursor-pointer items-start gap-3 py-3"
                >
                  <Checkbox
                    checked={completed}
                    onChange={() => setTaskCompleted(reminder.id, !completed)}
                    label={reminder.name}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium transition ${
                        completed ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {reminder.name}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        completed ? "font-medium text-green-700" : "text-muted"
                      }`}
                    >
                      {completed ? "Completed" : `Due ${reminder.dueDate}`}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
          <Button
            variant="ghost"
            className="mt-1 px-0 text-purple-700"
            onClick={() => navigate("Reminders")}
          >
            View all <Icon name="arrow" className="size-4" />
          </Button>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">Current Goals</div>
          <div className="mt-1">
            {goals.slice(0, 3).map((goal) => (
              <CompactGoal
                key={goal.id}
                title={goal.title}
                category={goal.category}
                progress={goal.progress}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-1 px-0 text-purple-700"
            onClick={() => navigate("My Goals")}
          >
            View all goals <Icon name="arrow" className="size-4" />
          </Button>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="dashboard-compact-card">
          <div className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            2025 Mid-year
          </div>
          <div className="mt-1 text-base font-semibold">Performance Review</div>
          {reviewState === "published" ? (
            <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center">
              <div>
                <Badge tone="green">Published</Badge>
                <div className="mt-2 text-sm text-green-950">
                  Your mid-year review is ready to view.
                </div>
              </div>
              <Button onClick={() => navigate("Performance Reviews")}>
                View review
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
                <Icon name="lock" className="size-4" />
              </div>
              <div>
                <Badge tone="amber">Pending HR Publication</Badge>
                <div className="mt-2 text-sm leading-6 text-muted">
                  Your evaluation is currently under HR review. Ratings and
                  feedback will remain hidden until HR publishes the review.
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">Recent Activity</div>
          <div className="mt-2 divide-y divide-border">
            {[
              [
                "Goal progress updated",
                "Onboarding research quality moved to 76%",
                "2h",
              ],
              [
                "Feedback received",
                "Comment added to mobile launch goal",
                "Yesterday",
              ],
              [
                "MIRAI milestone completed",
                "Q3 peer reflection submitted",
                "Sep 12",
              ],
            ].map((item) => (
              <div key={item[0]} className="flex items-start gap-3 py-2.5">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-purple-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold">{item[0]}</div>
                  <div className="mt-0.5 truncate text-xs text-muted">
                    {item[1]}
                  </div>
                </div>
                <div className="text-xs text-muted">{item[2]}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function CompactMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "green" | "amber"
}) {
  return (
    <div className="px-3 py-1 first:pl-0">
      <div className="text-xs text-muted">{label}</div>
      <div
        className={`mt-1 text-sm font-semibold ${
          tone === "green"
            ? "text-green-700"
            : tone === "amber"
              ? "text-amber-700"
              : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function CompactGoal({
  title,
  category,
  progress,
}: {
  title: string
  category: string
  progress: number
}) {
  return (
    <div className="border-b border-border py-2.5 last:border-0">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-0.5 text-xs text-muted">{category}</div>
        </div>
        <div className="text-xs font-semibold">{progress}%</div>
      </div>
      <Progress value={progress} />
    </div>
  )
}

function ActionItem({
  title,
  meta,
  tone,
}: {
  title: string
  meta: string
  tone: "amber" | "purple" | "green"
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
      <div className={`size-2 shrink-0 rounded-full bg-${tone}-500`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        <div className="mt-1 text-xs text-muted">{meta}</div>
      </div>
      <Icon name="arrow" className="size-4 text-muted" />
    </div>
  )
}

function GoalRow({
  title,
  category,
  progress,
}: {
  title: string
  category: string
  progress: number
}) {
  return (
    <div className="border-b border-border py-4 last:border-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted">{category}</div>
        </div>
        <div className="text-sm font-semibold">{progress}%</div>
      </div>
      <Progress value={progress} />
    </div>
  )
}

function MentorDashboard({
  reviewState,
  onSubmit,
  navigate,
}: {
  reviewState: ReviewState
  onSubmit: () => void
  navigate: (page: string) => void
}) {
  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            Monday, 15 September
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            Good morning, Daniel.
          </div>
          <div className="mt-1 text-sm text-muted">
            Here’s what needs your attention today.
          </div>
        </div>
        <Button onClick={() => navigate("Goals")}>
          <Icon name="plus" className="size-4" /> Assign goal
        </Button>
      </div>

      <div className="dashboard-commandbar">
        <div className="grid flex-1 grid-cols-2 divide-x divide-border sm:grid-cols-4">
          <CompactMetric label="Team members" value="12" />
          <CompactMetric label="Goals in progress" value="34" />
          <CompactMetric label="Pending evaluations" value="4" tone="amber" />
          <CompactMetric label="Completed evaluations" value="8" tone="green" />
        </div>
      </div>

      <Card className="mt-4 dashboard-compact-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-base font-semibold">Needs attention</div>
            <div className="mt-1 text-xs text-muted">
              2 evaluations due this week
            </div>
          </div>
          <Badge tone="amber">2 actions</Badge>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Avatar initials="AM" small />
              <div>
                <div className="text-sm font-semibold">Alex Morgan</div>
                <div className="mt-0.5 text-xs text-muted">
                  Mid-year evaluation · Due Sep 18
                </div>
                <div className="mt-2">
                  <Badge
                    tone={
                      reviewState === "draft"
                        ? "amber"
                        : reviewState === "submitted"
                          ? "blue"
                          : "green"
                    }
                  >
                    {reviewState === "draft"
                      ? "Ready to submit"
                      : reviewState === "submitted"
                        ? "Pending HR Review"
                        : "Published by HR"}
                  </Badge>
                </div>
              </div>
            </div>
            {reviewState === "draft" ? (
              <Button onClick={onSubmit}>Submit evaluation</Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate("Reviews")}>
                View review
              </Button>
            )}
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Avatar initials="PR" small />
              <div>
                <div className="text-sm font-semibold">Priya Rao</div>
                <div className="mt-0.5 text-xs text-muted">
                  Feedback required
                </div>
                <div className="mt-2">
                  <Badge tone="purple">Needs attention</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("Performance Evaluations")}
            >
              Review
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <div className="text-base font-semibold">Team performance</div>
        <div className="mt-2 divide-y divide-border">
          {[
            ["Alex Morgan", "AM", 76, "On track", "green"],
            ["Maya Chen", "MC", 68, "Needs attention", "purple"],
            ["Noah Williams", "NW", 88, "On track", "green"],
          ].map((person) => (
            <div
              key={person[0] as string}
              className="grid gap-3 py-3 sm:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.7fr)_auto] sm:items-center"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={person[1] as string} small />
                <div className="text-sm font-semibold">{person[0]}</div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>Progress</span>
                  <strong className="text-ink">{person[2]}%</strong>
                </div>
                <Progress value={person[2] as number} />
              </div>
              <Badge tone={person[4] as "green" | "purple"}>{person[3]}</Badge>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-1 px-0 text-purple-700"
          onClick={() => navigate("My Team")}
        >
          View all team <Icon name="arrow" className="size-4" />
        </Button>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <div className="text-base font-semibold">Recent team activity</div>
        <div className="mt-2 grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            [
              "Maya updated a goal",
              "Design system rollout moved to 68%",
              "34m",
            ],
            ["Noah completed a task", "Research synthesis delivered", "2h"],
            [
              "Priya needs attention",
              "A key goal has moved at risk",
              "Yesterday",
            ],
          ].map((item) => (
            <div
              key={item[0]}
              className="flex items-start gap-3 py-3 md:px-4 md:first:pl-0"
            >
              <div className="mt-1 size-2 shrink-0 rounded-full bg-purple-500" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{item[0]}</div>
                <div className="mt-1 truncate text-xs text-muted">
                  {item[1]}
                </div>
              </div>
              <div className="text-xs text-muted">{item[2]}</div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-1 px-0 text-purple-700"
          onClick={() => navigate("My Team")}
        >
          View all <Icon name="arrow" className="size-4" />
        </Button>
      </Card>
    </>
  )
}

function MentorEvaluationsPage({
  cycle,
  evaluations = initialMentorEvaluations,
  goals = initialMentorGoals,
  updateEvaluation = () => undefined,
  submitEvaluation = () => undefined,
}: {
  cycle: ReviewCycle | null
  evaluations?: MentorEvaluation[]
  goals?: MentorGoal[]
  updateEvaluation?: (
    evaluationId: string,
    updates: Partial<MentorEvaluation>,
  ) => void
  submitEvaluation?: (evaluationId: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [returnedEditing, setReturnedEditing] = useState(false)
  const [rating, setRating] = useState("")
  const [overallFeedback, setOverallFeedback] = useState("")
  const [strengths, setStrengths] = useState("")
  const [areasForImprovement, setAreasForImprovement] = useState("")
  const [developmentRecommendations, setDevelopmentRecommendations] =
    useState("")
  const selected =
    evaluations.find((evaluation) => evaluation.id === selectedId) ?? null
  const selectedGoals = selected
    ? goals.filter((goal) => goal.intern === selected.intern)
    : []
  const goalCompletion = (intern: string) => {
    const internGoals = goals.filter((goal) => goal.intern === intern)
    if (internGoals.length === 0) return 0
    return Math.round(
      (internGoals.filter((goal) => goal.status === "Completed").length /
        internGoals.length) *
        100,
    )
  }
  const statusTone = (
    status: EvaluationStatus,
  ): "neutral" | "purple" | "blue" | "amber" | "green" =>
    status === "Draft"
      ? "neutral"
      : status === "Submitted to HR"
        ? "blue"
        : status === "Returned by HR"
          ? "amber"
          : status === "Published"
            ? "green"
            : "purple"
  const mentorStatus = (status: EvaluationStatus) =>
    status === "Changes Requested" ? "Returned by HR" : status
  const openEvaluation = (evaluation: MentorEvaluation) => {
    setSelectedId(evaluation.id)
    setEvidenceOpen(false)
    setReturnedEditing(false)
    setRating(evaluation.rating)
    setOverallFeedback(evaluation.overallFeedback)
    setStrengths(evaluation.strengths)
    setAreasForImprovement(evaluation.areasForImprovement)
    setDevelopmentRecommendations(evaluation.developmentRecommendations)
  }
  const saveDraft = () => {
    if (!selected) return
    updateEvaluation(selected.id, {
      rating,
      overallFeedback,
      strengths,
      areasForImprovement,
      developmentRecommendations,
      status:
        rating && overallFeedback.trim() ? "Ready to submit" : "In progress",
    })
  }
  const canEdit = selected
    ? ["Draft", "In progress", "Ready to submit"].includes(selected.status) ||
      (["Returned by HR", "Changes Requested"].includes(selected.status) &&
        returnedEditing)
    : false

  return (
    <>
      <PageIntro
        eyebrow="Intern evaluations"
        title="Performance Evaluations"
        copy="Evaluate your interns and submit evaluations to HR for review."
      />
      {!cycle || cycle.status !== "Open" ? (
        <Card className="py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-neutral-100 text-muted">
            <Icon name="review" />
          </div>
          <div className="mt-5 text-xl font-semibold">
            No active evaluation cycle
          </div>
          <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            HR has not opened an evaluation cycle. Evaluation submission is
            unavailable.
          </div>
          <Button className="mt-5" disabled>
            Submit evaluation to HR
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="mb-2 flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold">{cycle.name}</div>
              <div className="mt-1 text-xs text-muted">
                Active HR-defined evaluation cycle
              </div>
            </div>
            <Badge tone="purple">
              {
                evaluations.filter(
                  (evaluation) => evaluation.status !== "Published",
                ).length
              }{" "}
              evaluations
            </Badge>
          </div>
          {evaluations.map((evaluation) => {
            const completed = goalCompletion(evaluation.intern)
            return (
              <Button
                key={evaluation.id}
                variant="ghost"
                className="evaluation-list-row"
                onClick={() => openEvaluation(evaluation)}
              >
                <span className="flex items-center gap-3 text-left">
                  <Avatar initials={evaluation.initials} small />
                  <span>
                    <span className="block text-sm font-semibold">
                      {evaluation.intern}
                    </span>
                    <span className="mt-1 block text-xs font-normal text-muted">
                      {evaluation.section} · {cycle.name}
                    </span>
                  </span>
                </span>
                <span className="text-left">
                  <span className="block text-xs font-normal text-muted">
                    Overall rating
                  </span>
                  <span className="mt-1 block text-sm font-semibold">
                    {evaluation.rating
                      ? `${evaluation.rating} / 5`
                      : "Not entered"}
                  </span>
                </span>
                <span className="text-left">
                  <span className="block text-xs font-normal text-muted">
                    Goals completed
                  </span>
                  <span className="mt-1 block text-sm font-semibold">
                    {completed}%
                  </span>
                </span>
                <Badge tone={statusTone(evaluation.status)}>
                  {mentorStatus(evaluation.status)}
                </Badge>
                <Icon name="arrow" className="size-4 text-muted" />
              </Button>
            )
          })}
        </Card>
      )}

      {selected && cycle && (
        <Modal onClose={() => setSelectedId(null)}>
          {evidenceOpen ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-purple-600">
                    Goal evidence
                  </div>
                  <div className="mt-2 text-xl font-semibold">
                    {selected.intern}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="icon-button"
                  onClick={() => setSelectedId(null)}
                >
                  <Icon name="close" className="size-4" />
                </Button>
              </div>
              <div className="mt-5 divide-y divide-border">
                {selectedGoals.length > 0 ? (
                  selectedGoals.map((goal) => (
                    <div key={goal.id} className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">
                            {goal.title}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            Due {goal.dueDate} · {goal.status}
                          </div>
                        </div>
                        <strong className="text-sm">{goal.progress}%</strong>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={goal.progress}
                          tone={
                            goal.status === "Completed" ? "green" : "purple"
                          }
                        />
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        {goal.description}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-sm text-muted">
                    No goals fall within this evaluation cycle.
                  </div>
                )}
              </div>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setEvidenceOpen(false)}
              >
                Back to evaluation
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone={statusTone(selected.status)}>
                    {mentorStatus(selected.status)}
                  </Badge>
                  <div className="mt-3 text-xl font-semibold tracking-tight">
                    {selected.intern} · {cycle.name}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {selected.section}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="icon-button"
                  onClick={() => setSelectedId(null)}
                >
                  <Icon name="close" className="size-4" />
                </Button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="stat-tile">
                  <span>Overall rating</span>
                  <strong>
                    {selected.rating ? `${selected.rating} / 5` : "Not entered"}
                  </strong>
                </div>
                <div className="stat-tile">
                  <span>Goals completed</span>
                  <strong>{goalCompletion(selected.intern)}%</strong>
                </div>
                <div className="stat-tile">
                  <span>Review period</span>
                  <strong>
                    {cycle.startDate} – {cycle.endDate}
                  </strong>
                </div>
              </div>

              {canEdit ? (
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="field-label">Overall rating</span>
                    <Select
                      value={rating}
                      onChange={setRating}
                      ariaLabel="Overall rating"
                    >
                      <option value="">Select rating</option>
                      <option value="1">1 / 5</option>
                      <option value="2">2 / 5</option>
                      <option value="3">3 / 5</option>
                      <option value="4">4 / 5</option>
                      <option value="5">5 / 5</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Overall feedback</span>
                    <TextInput
                      value={overallFeedback}
                      onChange={setOverallFeedback}
                      placeholder="Enter your evaluation feedback"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Strengths</span>
                    <TextInput
                      value={strengths}
                      onChange={setStrengths}
                      placeholder="Document observed strengths"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Areas for improvement</span>
                    <TextInput
                      value={areasForImprovement}
                      onChange={setAreasForImprovement}
                      placeholder="Identify focused improvement areas"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">
                      Development recommendations
                    </span>
                    <TextInput
                      value={developmentRecommendations}
                      onChange={setDevelopmentRecommendations}
                      placeholder="Recommend practical next steps"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-5 space-y-3 rounded-xl bg-neutral-50 p-4">
                  <TaskDetail
                    label="Overall feedback"
                    value={selected.overallFeedback || "Not provided"}
                  />
                  <TaskDetail
                    label="Strengths"
                    value={selected.strengths || "Not provided"}
                  />
                  <TaskDetail
                    label="Areas for improvement"
                    value={selected.areasForImprovement || "Not provided"}
                  />
                  <TaskDetail
                    label="Development recommendations"
                    value={
                      selected.developmentRecommendations || "Not provided"
                    }
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEvidenceOpen(true)}
                >
                  View goal evidence
                </Button>
                {["Returned by HR", "Changes Requested"].includes(
                  selected.status,
                ) && !returnedEditing ? (
                  <Button onClick={() => setReturnedEditing(true)}>
                    <Icon name="edit" className="size-4" /> Edit evaluation
                  </Button>
                ) : canEdit ? (
                  <>
                    <Button variant="secondary" onClick={saveDraft}>
                      Save draft
                    </Button>
                    <Button
                      disabled={!rating || !overallFeedback.trim()}
                      onClick={() => {
                        saveDraft()
                        submitEvaluation(selected.id)
                      }}
                    >
                      Submit evaluation to HR
                    </Button>
                  </>
                ) : (
                  <Button disabled>
                    {selected.status === "Submitted to HR"
                      ? "Submitted to HR"
                      : selected.status}
                  </Button>
                )}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  )
}

function HRDashboard({
  cycles,
  evaluations,
  updateEvaluationStatus,
  createCycle,
  updateCycle,
  navigate,
}: {
  cycles: ReviewCycle[]
  evaluations: MentorEvaluation[]
  updateEvaluationStatus: (
    evaluationId: string,
    status: EvaluationStatus,
  ) => void
  createCycle: (cycle: ReviewCycle) => void
  updateCycle: (cycleId: string, updates: Partial<ReviewCycle>) => void
  navigate: (page: string) => void
}) {
  const [cyclePanelOpen, setCyclePanelOpen] = useState(false)
  const [selectedEvaluationId, setSelectedEvaluationId] =
    useState<string | null>(null)
  const [cycleFilter, setCycleFilter] = useState(
    cycles.find((cycle) => cycle.status === "Open")?.id ?? cycles[0]?.id ?? "",
  )
  const [overviewFilterOpen, setOverviewFilterOpen] = useState(false)
  const [overviewCycleFilter, setOverviewCycleFilter] = useState("All")
  const [sectionFilter, setSectionFilter] = useState("All")
  const [subsectionFilter, setSubsectionFilter] = useState("All")
  const [mentorFilter, setMentorFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [classificationFilter, setClassificationFilter] = useState("All")
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null)
  const [cycleName, setCycleName] = useState("")
  const [cycleStart, setCycleStart] = useState("")
  const [cycleEnd, setCycleEnd] = useState("")
  const [eligiblePopulation, setEligiblePopulation] = useState("All interns")
  const [activities, setActivities] = useState([
    {
      title: "Evaluation submitted",
      detail: "Daniel Ortiz submitted an evaluation for Maya Chen",
      createdAt: Date.now() - 42 * 60 * 1000,
    },
    {
      title: "Evaluation cycle opened",
      detail: `${cycles.find((cycle) => cycle.status === "Open")?.name ?? "Evaluation cycle"} is now open`,
      createdAt: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      title: "Changes requested",
      detail: "Evaluation returned for Mentor updates",
      createdAt: Date.now() - 26 * 60 * 60 * 1000,
    },
  ])
  const interns = [
    { name: "Alex Morgan", section: "A", subsection: "A1" },
    { name: "Maya Chen", section: "B", subsection: "B2" },
    { name: "Noah Williams", section: "C", subsection: "C1" },
    { name: "Priya Rao", section: "D", subsection: "D2" },
  ]
  const openCycles = cycles.filter((cycle) => cycle.status === "Open")
  const pendingMentor = evaluations.filter((evaluation) =>
    [
      "Draft",
      "In progress",
      "Ready to submit",
      "Returned by HR",
      "Changes Requested",
    ].includes(evaluation.status),
  )
  const awaitingHR = evaluations.filter((evaluation) =>
    ["Submitted to HR", "Pending HR Review", "Approved"].includes(
      evaluation.status,
    ),
  )
  const published = evaluations.filter(
    (evaluation) => evaluation.status === "Published",
  )
  const selectedEvaluation =
    evaluations.find((evaluation) => evaluation.id === selectedEvaluationId) ??
    null
  const selectedCycle =
    cycles.find((cycle) => cycle.id === cycleFilter) ?? cycles[0] ?? null
  const queue = evaluations.filter((evaluation) =>
    [
      "Submitted to HR",
      "Pending HR Review",
      "Changes Requested",
      "Approved",
      "Published",
    ].includes(evaluation.status),
  )
  const evaluationClassification = (evaluation: MentorEvaluation) => {
    const score = Number(evaluation.rating)
    if (score >= 4.5) return "Exceeds expectations"
    if (score >= 3) return "Meets expectations"
    if (score >= 2) return "Developing"
    return "Needs support"
  }
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const [sectionText, subsection] = evaluation.section
      .replace("Section ", "")
      .split(" · ")
    return (
      (!cycleFilter || evaluation.cycleId === cycleFilter) &&
      (overviewCycleFilter === "All" ||
        evaluation.cycleId === overviewCycleFilter) &&
      (sectionFilter === "All" || sectionText === sectionFilter) &&
      (subsectionFilter === "All" || subsection === subsectionFilter) &&
      (mentorFilter === "All" || evaluation.mentor === mentorFilter) &&
      (statusFilter === "All" || evaluation.status === statusFilter) &&
      (classificationFilter === "All" ||
        evaluationClassification(evaluation) === classificationFilter) &&
      Boolean(evaluation.rating)
    )
  })
  const scores = filteredEvaluations
    .map((evaluation) => Number(evaluation.rating))
    .filter((rating) => !Number.isNaN(rating))
  const averageScore = scores.length
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0
  const distributions = [
    {
      label: "Exceeds expectations",
      count: scores.filter((score) => score >= 4.5).length,
      color: "bg-purple-600",
    },
    {
      label: "Meets expectations",
      count: scores.filter((score) => score >= 3 && score < 4.5).length,
      color: "bg-blue-500",
    },
    {
      label: "Developing",
      count: scores.filter((score) => score >= 2 && score < 3).length,
      color: "bg-amber-500",
    },
    {
      label: "Needs support",
      count: scores.filter((score) => score < 2).length,
      color: "bg-red-500",
    },
  ]
  const distributionPercentages = distributions.map((item) =>
    scores.length ? Math.round((item.count / scores.length) * 100) : 0,
  )
  const donutStyle = {
    "--donut-first": `${distributionPercentages[0]}%`,
    "--donut-second": `${distributionPercentages[0] + distributionPercentages[1]}%`,
    "--donut-third": `${distributionPercentages[0] + distributionPercentages[1] + distributionPercentages[2]}%`,
  } as CSSProperties
  const activeOverviewFilters = [
    {
      key: "cycle",
      label: "Cycle",
      value: overviewCycleFilter,
      clear: () => setOverviewCycleFilter("All"),
    },
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      clear: () => setStatusFilter("All"),
    },
    {
      key: "section",
      label: "Section",
      value: sectionFilter,
      clear: () => setSectionFilter("All"),
    },
    {
      key: "classification",
      label: "Classification",
      value: classificationFilter,
      clear: () => setClassificationFilter("All"),
    },
  ].filter((filter) => filter.value !== "All")
  const relativeTime = (time: number) => {
    const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000))
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
  }
  const addActivity = (title: string, detail: string) =>
    setActivities((current) =>
      [{ title, detail, createdAt: Date.now() }, ...current].slice(0, 5),
    )
  const actOnEvaluation = (
    evaluation: MentorEvaluation,
    status: EvaluationStatus,
  ) => {
    updateEvaluationStatus(evaluation.id, status)
    const action =
      status === "Published"
        ? "Evaluation published"
        : status === "Changes Requested"
          ? "Changes requested"
          : status === "Approved"
            ? "Evaluation approved"
            : "Evaluation opened for review"
    addActivity(
      action,
      `${evaluation.intern} · ${cycles.find((cycle) => cycle.id === evaluation.cycleId)?.name ?? "Evaluation cycle"}`,
    )
    if (status === "Published" || status === "Changes Requested")
      setSelectedEvaluationId(null)
  }
  const resetCycleForm = () => {
    setEditingCycleId(null)
    setCycleName("")
    setCycleStart("")
    setCycleEnd("")
    setEligiblePopulation("All interns")
  }
  const saveCycle = () => {
    if (!cycleName.trim() || !cycleStart || !cycleEnd) return
    if (editingCycleId) {
      updateCycle(editingCycleId, {
        name: cycleName.trim(),
        startDate: cycleStart,
        endDate: cycleEnd,
        eligiblePopulation,
      })
    } else {
      createCycle({
        id: `cycle-${Date.now()}`,
        name: cycleName.trim(),
        startDate: cycleStart,
        endDate: cycleEnd,
        eligiblePopulation,
        applicableEmployees: interns.map(
          (_, index) => `EMP-${1042 + index * 6}`,
        ),
        status: "Draft",
        publicationStatus: "draft",
      })
      addActivity(
        "Evaluation cycle created",
        `${cycleName.trim()} was created as a draft`,
      )
    }
    resetCycleForm()
  }

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            People operations
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            Performance review control center.
          </div>
          <div className="mt-1 text-sm text-muted">
            Manage evaluation cycles, review mentor submissions, and publish
            intern outcomes.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setCyclePanelOpen(true)}>
            <Icon name="settings" className="size-4" /> Manage evaluation cycles
          </Button>
          <Button onClick={() => navigate("Review Management")}>
            Review evaluations <Icon name="arrow" className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <HRCompactMetric
          label="Interns"
          value={String(interns.length)}
          note="Across Sections A–D"
          icon="users"
        />
        <HRCompactMetric
          label="Active evaluation cycles"
          value={String(openCycles.length)}
          note={
            openCycles.map((cycle) => cycle.name).join(" · ") ||
            "No open cycles"
          }
          icon="journey"
          tone="blue"
        />
        <HRCompactMetric
          label="Pending evaluations"
          value={String(pendingMentor.length)}
          note={`${pendingMentor.filter((evaluation) => evaluation.status === "Ready to submit").length} ready to submit`}
          icon="review"
          tone="amber"
        />
        <HRCompactMetric
          label="Awaiting HR review"
          value={String(awaitingHR.length)}
          note="Requires HR action"
          icon="clock"
          tone="amber"
        />
        <HRCompactMetric
          label="Published"
          value={String(published.length)}
          note={`${
            interns.length
              ? Math.round((published.length / interns.length) * 100)
              : 0
          }% of interns`}
          icon="check"
          tone="green"
        />
      </div>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle
          title="Evaluations awaiting HR action"
          action={
            <div className="flex items-center gap-2">
              <Badge tone="amber">{awaitingHR.length} awaiting action</Badge>
              <Button
                variant="ghost"
                onClick={() => navigate("Review Management")}
              >
                View all <Icon name="arrow" className="size-4" />
              </Button>
            </div>
          }
        />
        {queue
          .filter((evaluation) => evaluation.status !== "Published")
          .slice(0, 3).length > 0 ? (
          queue
            .filter((evaluation) => evaluation.status !== "Published")
            .slice(0, 3)
            .map((evaluation) => {
              const cycle = cycles.find(
                (item) => item.id === evaluation.cycleId,
              )
              return (
                <div
                  key={evaluation.id}
                  className="grid gap-3 border-b border-border py-3 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={evaluation.initials} small />
                    <div>
                      <div className="text-sm font-semibold">
                        {evaluation.intern}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {evaluation.section} · Mentor: {evaluation.mentor}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {cycle?.name ?? "Evaluation cycle"} · Rating{" "}
                        {evaluation.rating || "Not entered"}
                      </div>
                    </div>
                  </div>
                  <Badge
                    tone={
                      evaluation.status === "Approved"
                        ? "purple"
                        : evaluation.status === "Changes Requested"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {evaluation.status}
                  </Badge>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedEvaluationId(evaluation.id)}
                  >
                    {evaluation.status === "Approved"
                      ? "Publish"
                      : evaluation.status === "Changes Requested"
                        ? "View feedback"
                        : "Review"}
                  </Button>
                </div>
              )
            })
        ) : (
          <div className="py-8 text-center text-sm text-muted">
            No evaluations currently require HR action.
          </div>
        )}
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle
          title="Performance overview"
          eyebrow={selectedCycle?.name ?? "No cycle selected"}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <Select
              value={cycleFilter}
              onChange={setCycleFilter}
              ariaLabel="Evaluation cycle filter"
            >
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setOverviewFilterOpen(!overviewFilterOpen)}
            >
              <Icon name="settings" className="size-4" /> Filter
              {activeOverviewFilters.length > 0 && (
                <Badge tone="purple">{activeOverviewFilters.length}</Badge>
              )}
            </Button>
            {overviewFilterOpen && (
              <Card className="absolute right-0 top-12 z-30 w-80 p-4 shadow-xl">
                <div className="mb-3 text-sm font-semibold">
                  Filter performance overview
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="field-label">Cycle</span>
                    <Select
                      value={overviewCycleFilter}
                      onChange={(value) => {
                        setOverviewCycleFilter(value)
                        if (value !== "All") setCycleFilter(value)
                      }}
                      ariaLabel="Overview cycle filter"
                    >
                      <option value="All">All</option>
                      {cycles.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Status</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      ariaLabel="Overview status filter"
                    >
                      <option value="All">All</option>
                      {[
                        "Draft",
                        "In progress",
                        "Ready to submit",
                        "Submitted to HR",
                        "Pending HR Review",
                        "Changes Requested",
                        "Approved",
                        "Published",
                      ].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Section</span>
                    <Select
                      value={sectionFilter}
                      onChange={(value) => {
                        setSectionFilter(value)
                        setSubsectionFilter("All")
                      }}
                      ariaLabel="Overview section filter"
                    >
                      <option value="All">All</option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Classification</span>
                    <Select
                      value={classificationFilter}
                      onChange={setClassificationFilter}
                      ariaLabel="Overview classification filter"
                    >
                      <option value="All">All</option>
                      <option>Exceeds expectations</option>
                      <option>Meets expectations</option>
                      <option>Developing</option>
                      <option>Needs support</option>
                    </Select>
                  </label>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOverviewCycleFilter("All")
                      setStatusFilter("All")
                      setSectionFilter("All")
                      setClassificationFilter("All")
                    }}
                  >
                    Clear all
                  </Button>
                  <Button onClick={() => setOverviewFilterOpen(false)}>
                    Apply filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
        {activeOverviewFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeOverviewFilters.map((filter) => (
              <div key={filter.key} className="skill-pill">
                <span>
                  {filter.label}:{" "}
                  {filter.key === "cycle"
                    ? cycles.find((cycle) => cycle.id === filter.value)?.name
                    : filter.value}
                </span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={filter.clear}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div className="flex justify-center">
            <div
              className={`donut ${scores.length === 0 ? "donut-empty" : ""}`}
              style={donutStyle}
            >
              <div className="donut-center">
                <strong>{averageScore ? averageScore.toFixed(1) : "—"}</strong>
                <span>Average score</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {distributions.map((item, index) => (
              <Legend
                key={item.label}
                color={item.color}
                label={item.label}
                value={`${distributionPercentages[index]}%`}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle
          title="Recent HR activity"
          action={<Button variant="ghost">View all</Button>}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {activities.slice(0, 3).map((activity) => (
            <div
              key={`${activity.title}-${activity.createdAt}`}
              className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple-100 text-purple-700">
                <Icon name="audit" className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{activity.title}</div>
                <div className="mt-1 text-xs leading-5 text-muted">
                  {activity.detail}
                </div>
              </div>
              <span className="text-xs text-muted">
                {relativeTime(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {selectedEvaluation && (
        <Modal onClose={() => setSelectedEvaluationId(null)}>
          <Badge
            tone={
              selectedEvaluation.status === "Approved"
                ? "purple"
                : selectedEvaluation.status === "Published"
                  ? "green"
                  : "blue"
            }
          >
            {selectedEvaluation.status}
          </Badge>
          <div className="mt-3 text-xl font-semibold">
            {selectedEvaluation.intern}
          </div>
          <div className="mt-1 text-sm text-muted">
            {selectedEvaluation.section} · Mentor: {selectedEvaluation.mentor}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <TaskDetail
              label="Evaluation cycle"
              value={
                cycles.find((cycle) => cycle.id === selectedEvaluation.cycleId)
                  ?.name ?? "Not available"
              }
            />
            <TaskDetail
              label="Overall rating"
              value={
                selectedEvaluation.rating
                  ? `${selectedEvaluation.rating} / 5`
                  : "Not entered"
              }
            />
          </div>
          <div className="mt-5 space-y-3 rounded-xl bg-neutral-50 p-4">
            <TaskDetail
              label="Overall feedback"
              value={selectedEvaluation.overallFeedback || "Not provided"}
            />
            <TaskDetail
              label="Strengths"
              value={selectedEvaluation.strengths || "Not provided"}
            />
            <TaskDetail
              label="Areas for improvement"
              value={selectedEvaluation.areasForImprovement || "Not provided"}
            />
            <TaskDetail
              label="Development recommendations"
              value={
                selectedEvaluation.developmentRecommendations || "Not provided"
              }
            />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {["Submitted to HR", "Pending HR Review"].includes(
              selectedEvaluation.status,
            ) && (
              <>
                <Button
                  variant="secondary"
                  onClick={() =>
                    actOnEvaluation(selectedEvaluation, "Changes Requested")
                  }
                >
                  Request changes
                </Button>
                <Button
                  onClick={() =>
                    actOnEvaluation(selectedEvaluation, "Approved")
                  }
                >
                  <Icon name="check" className="size-4" /> Approve
                </Button>
              </>
            )}
            {selectedEvaluation.status === "Approved" && (
              <Button
                onClick={() => actOnEvaluation(selectedEvaluation, "Published")}
              >
                <Icon name="check" className="size-4" /> Publish evaluation
              </Button>
            )}
            {selectedEvaluation.status === "Submitted to HR" && (
              <Button
                variant="ghost"
                onClick={() =>
                  actOnEvaluation(selectedEvaluation, "Pending HR Review")
                }
              >
                Begin review
              </Button>
            )}
            {selectedEvaluation.status === "Changes Requested" && (
              <Button variant="secondary">Review resubmission</Button>
            )}
            {selectedEvaluation.status === "Published" && (
              <Button
                variant="secondary"
                onClick={() => setSelectedEvaluationId(null)}
              >
                Close
              </Button>
            )}
          </div>
        </Modal>
      )}

      {cyclePanelOpen && (
        <Modal onClose={() => setCyclePanelOpen(false)}>
          <SectionTitle
            title="Manage evaluation cycles"
            eyebrow="HR workspace"
          />
          <div className="space-y-2">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{cycle.name}</div>
                  <div className="mt-1 text-xs text-muted">
                    {cycle.startDate} – {cycle.endDate} ·{" "}
                    {cycle.eligiblePopulation}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      cycle.status === "Open"
                        ? "green"
                        : cycle.status === "Draft"
                          ? "neutral"
                          : "amber"
                    }
                  >
                    {cycle.status}
                  </Badge>
                  {cycle.status === "Draft" && (
                    <Button
                      variant="ghost"
                      className="icon-button"
                      onClick={() => {
                        setEditingCycleId(cycle.id)
                        setCycleName(cycle.name)
                        setCycleStart(cycle.startDate)
                        setCycleEnd(cycle.endDate)
                        setEligiblePopulation(cycle.eligiblePopulation)
                      }}
                    >
                      <Icon name="edit" className="size-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const status = cycle.status === "Open" ? "Closed" : "Open"
                    updateCycle(cycle.id, { status })
                    addActivity(
                      `Evaluation cycle ${
                        status === "Open" ? "opened" : "closed"
                      }`,
                      `${cycle.name} is now ${status.toLowerCase()}`,
                    )
                  }}
                >
                  {cycle.status === "Open" ? "Close" : "Open"}
                </Button>
              </div>
            ))}
          </div>
          <div className="my-5 h-px bg-border" />
          <div className="text-sm font-semibold">
            {editingCycleId ? "Edit draft cycle" : "Create evaluation cycle"}
          </div>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="field-label">Cycle name</span>
              <TextInput
                value={cycleName}
                onChange={setCycleName}
                placeholder="e.g. Quarterly Evaluation"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="field-label">Start date</span>
                <TextInput
                  type="date"
                  value={cycleStart}
                  onChange={setCycleStart}
                />
              </label>
              <label>
                <span className="field-label">End date</span>
                <TextInput
                  type="date"
                  value={cycleEnd}
                  onChange={setCycleEnd}
                />
              </label>
            </div>
            <label className="block">
              <span className="field-label">Eligible population</span>
              <Select
                value={eligiblePopulation}
                onChange={setEligiblePopulation}
                ariaLabel="Eligible population"
              >
                <option>All interns</option>
                <option>Section A</option>
                <option>Section B</option>
                <option>Section C</option>
                <option>Section D</option>
                <option>Selected subsections</option>
              </Select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={resetCycleForm}>
              Clear
            </Button>
            <Button
              disabled={!cycleName.trim() || !cycleStart || !cycleEnd}
              onClick={saveCycle}
            >
              {editingCycleId ? "Save changes" : "Create cycle"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function HRCompactMetric({
  label,
  value,
  note,
  icon,
  tone = "purple",
}: {
  label: string
  value: string
  note: string
  icon: IconName
  tone?: "purple" | "blue" | "green" | "amber"
}) {
  return (
    <Card className="flex min-h-28 items-center gap-3 p-4">
      <div className={`metric-icon metric-${tone}`}>
        <Icon name={icon} className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        <div className="mt-0.5 text-xs font-semibold">{label}</div>
        <div className="mt-1 truncate text-xs text-muted">{note}</div>
      </div>
    </Card>
  )
}

function Legend({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center text-sm">
      <span className={`mr-3 size-2.5 rounded-full ${color}`} />
      <span className="flex-1 text-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type DemoUser = {
  name: string
  email: string
  role: string
  status: "Active" | "Deactivated"
  initials: string
}

function AdminDashboard({
  users,
  addUser,
  navigate,
}: {
  users: DemoUser[]
  addUser: () => void
  navigate: (page: string) => void
}) {
  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            System administration
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            Secure, healthy, and under control.
          </div>
          <div className="mt-1 text-sm text-muted">
            Manage identities, permissions, and platform activity from a unified
            administrative workspace.
          </div>
        </div>
        <Button onClick={addUser}>
          <Icon name="plus" className="size-4" /> Add user
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HRCompactMetric
          label="Total users"
          value={String(248 + users.length - 5)}
          note="96% active accounts"
          icon="users"
        />
        <HRCompactMetric
          label="Active users"
          value="239"
          note="214 active this month"
          icon="check"
          tone="green"
        />
        <HRCompactMetric
          label="Mentors"
          value="32"
          note="Across 8 departments"
          icon="shield"
          tone="blue"
        />
        <HRCompactMetric
          label="Admin access"
          value="5"
          note="2 HR · 3 system admins"
          icon="lock"
          tone="amber"
        />
      </div>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle
          title="User accounts"
          action={
            <Button
              variant="ghost"
              onClick={() => navigate("User Management")}
            >
              Manage users <Icon name="arrow" className="size-4" />
            </Button>
          }
        />
        <div className="mb-3 flex gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput placeholder="Search users" className="w-full pl-9" />
          </div>
          <Button variant="secondary">All roles</Button>
        </div>
        <div className="data-grid data-grid-users table-head">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last active</span>
        </div>
        {users.slice(0, 5).map((user, index) => (
          <div
            key={user.email}
            className="data-grid data-grid-users min-h-16 border-b border-border py-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Avatar initials={user.initials} small />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="truncate text-xs text-muted">{user.email}</div>
              </div>
            </div>
            <span className="text-sm">{user.role}</span>
            <Badge tone={user.status === "Active" ? "green" : "neutral"}>
              {user.status}
            </Badge>
            <span className="text-xs text-muted">
              {index === 0 ? "Now" : `${index + 1}h ago`}
            </span>
          </div>
        ))}
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle title="Access & security" eyebrow="Last 30 days" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="stat-tile">
            <span>Sign-in success</span>
            <strong>99.4%</strong>
          </div>
          <div className="stat-tile">
            <span>Access changes</span>
            <strong>18</strong>
          </div>
          <div className="stat-tile">
            <span>Locked accounts</span>
            <strong>2</strong>
          </div>
          <div className="stat-tile">
            <span>MFA adoption</span>
            <strong>94%</strong>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-neutral-950 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-lg bg-green-400/15 text-green-400">
              <Icon name="shield" className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Systems operational</div>
              <div className="mt-0.5 text-xs text-white/50">
                No critical access risks detected
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <ActivityCard role="admin" />
      </div>
    </>
  )
}

function ActivityCard({ role }: { role: Role }) {
  const content: Record<Role, [string, string, string][]> = {
    employee: [
      [
        "Goal progress updated",
        "Onboarding research quality moved to 76%",
        "2h",
      ],
      [
        "Mentor feedback received",
        "Feedback added to mobile launch goal",
        "Yesterday",
      ],
      ["MIRAI milestone completed", "Q3 peer reflection submitted", "Sep 12"],
    ],
    mentor: [
      ["Maya updated a goal", "Design system rollout moved to 68%", "34m"],
      ["Noah completed a task", "Research synthesis delivered", "2h"],
      ["Priya needs attention", "A key goal has moved at risk", "Yesterday"],
    ],
    hr: [
      ["Review published", "Mid-year review for Leah Kim", "18m"],
      [
        "Evaluation submitted",
        "Daniel Ortiz submitted a team evaluation",
        "1h",
      ],
      ["Changes requested", "Review returned to Marcus Webb", "Yesterday"],
    ],
    admin: [
      ["Role changed", "Nadia Patel assigned HR Lead", "21m"],
      ["User created", "Ava Robinson added to Product", "1h"],
      ["Account deactivated", "Contractor access removed", "Yesterday"],
      ["Review published", "HR published review for Leah Kim", "Yesterday"],
    ],
  }
  return (
    <Card className={role === "admin" ? "dashboard-compact-card" : ""}>
      <SectionTitle
        title={
          role === "admin"
            ? "Recent system activity"
            : role === "hr"
              ? "Recent HR activity"
              : role === "mentor"
                ? "Recent team activity"
                : "Recent activity"
        }
        action={<Button variant="ghost">View all</Button>}
      />
      <div className="space-y-1">
        {content[role].map((item, index) => (
          <div
            key={item[0]}
            className={`flex items-start gap-3 rounded-xl hover:bg-neutral-50 ${
              role === "admin" ? "p-2.5" : "p-3"
            }`}
          >
            <div
              className={`mt-1 grid size-8 shrink-0 place-items-center rounded-lg ${
                index === 0
                  ? "bg-purple-100 text-purple-700"
                  : "bg-neutral-100 text-muted"
              }`}
            >
              <Icon
                name={
                  role === "admin" ? "audit" : index === 2 ? "bell" : "check"
                }
                className="size-4"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{item[0]}</div>
              <div className="mt-1 truncate text-xs text-muted">{item[1]}</div>
            </div>
            <div className="text-xs text-muted">{item[2]}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ReviewDetail({ cycle }: { cycle: ReviewCycle | null }) {
  if (!cycle || cycle.status !== "Open") {
    return (
      <>
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            Performance Reviews
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Performance Reviews
          </div>
        </div>
        <Card className="mx-auto max-w-3xl py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-neutral-100 text-muted">
            <Icon name="review" />
          </div>
          <div className="mt-5 text-xl font-semibold">
            No active review cycle
          </div>
          <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            There is currently no active performance review available for you.
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-purple-600">
          Performance Reviews
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {cycle.name}
        </div>
      </div>
      {cycle.publicationStatus !== "published" ? (
        <Card className="mx-auto max-w-3xl py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-700">
            <Icon name="lock" />
          </div>
          <div className="mt-5 text-xl font-semibold">
            Pending HR Publication
          </div>
          <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Your review has not been published by HR. Evaluation details,
            ratings, and mentor feedback will appear here once published.
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <Badge tone="green">Published</Badge>
            <div className="mt-3 text-sm text-muted">
              {cycle.startDate} – {cycle.endDate}
            </div>
            <div className="mt-6 text-5xl font-semibold">
              4.4<span className="text-xl text-muted"> / 5</span>
            </div>
            <div className="mt-2 text-lg font-semibold">
              Exceeds expectations
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>Goal performance</span>
                <strong>4.5</strong>
              </div>
              <Progress value={90} />
              <div className="mb-2 mt-4 flex justify-between text-sm">
                <span>Behaviors</span>
                <strong>4.3</strong>
              </div>
              <Progress value={86} />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Mentor feedback" />
            <div className="text-sm leading-7 text-muted">
              Alex consistently brings curiosity, rigor, and a strong learning
              mindset. Their research contributions improved the quality of
              decisions across the onboarding initiative.
            </div>
            <div className="my-6 h-px bg-border" />
            <SectionTitle title="Development feedback" />
            <div className="text-sm leading-7 text-muted">
              Continue building confidence in senior stakeholder presentations.
              Take ownership of one end-to-end discovery track during Q4.
            </div>
            <div className="mt-6 rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
              <strong>Next focus:</strong> Evidence-led storytelling and
              cross-functional facilitation.
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

function TaskPage({
  tasks,
  goals,
  updateTaskProgress,
  setTaskCompleted,
}: {
  tasks: EmployeeTask[]
  goals: EmployeeGoal[]
  updateTaskProgress: (taskId: string, progress: number) => void
  setTaskCompleted: (taskId: string, completed: boolean) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [sortBy, setSortBy] = useState("Priority")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const priorityOrder: Record<TaskPriority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  }
  const statusTone = (
    status: TaskStatus,
  ): "amber" | "purple" | "blue" | "green" =>
    status === "Needs Action"
      ? "amber"
      : status === "In Progress"
        ? "purple"
        : status === "Upcoming"
          ? "blue"
          : "green"
  const visibleTasks = [...tasks]
    .filter((task) => task.name.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (task) => statusFilter === "All statuses" || task.status === statusFilter,
    )
    .sort((first, second) => {
      if (sortBy === "Progress") return second.progress - first.progress
      if (sortBy === "Due date")
        return first.dueDate.localeCompare(second.dueDate)
      return priorityOrder[first.priority] - priorityOrder[second.priority]
    })
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const selectedTaskGoal = selectedTask
    ? goals.find((goal) => goal.id === selectedTask.relatedGoalId)
    : null
  const nextTask = [...tasks]
    .filter((task) => task.status !== "Completed")
    .sort(
      (first, second) =>
        priorityOrder[first.priority] - priorityOrder[second.priority],
    )[0]

  return (
    <>
      <PageIntro
        eyebrow="Execution"
        title="My tasks"
        copy="Stay focused on the actions that move your goals forward."
        action={
          <Button
            onClick={() => nextTask && setSelectedTaskId(nextTask.id)}
            disabled={!nextTask}
          >
            <Icon name="arrow" className="size-4" /> Continue next task
          </Button>
        }
      />
      <Card>
        <div className="grid gap-3 border-b border-border pb-5 md:grid-cols-[1fr_12rem_12rem]">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search my tasks"
              className="w-full pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter task status"
          >
            <option>All statuses</option>
            <option>Needs Action</option>
            <option>In Progress</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </Select>
          <Select value={sortBy} onChange={setSortBy} ariaLabel="Sort tasks">
            <option value="Priority">Sort: Priority</option>
            <option value="Due date">Sort: Due date</option>
            <option value="Progress">Sort: Progress</option>
          </Select>
        </div>

        <div className="mt-2">
          {visibleTasks.map((task) => (
            <Button
              key={task.id}
              variant="ghost"
              className="task-list-row"
              onClick={() => setSelectedTaskId(task.id)}
            >
              <span
                className={`task-check ${
                  task.status === "Completed" ? "task-check-complete" : ""
                }`}
              >
                {task.status === "Completed" && (
                  <Icon name="check" className="size-3" />
                )}
              </span>
              <span className="min-w-0 text-left">
                <span
                  className={`block text-sm font-semibold ${
                    task.status === "Completed"
                      ? "text-muted line-through"
                      : "text-ink"
                  }`}
                >
                  {task.name}
                </span>
                <span className="mt-1 block text-xs font-normal text-muted">
                  {task.category} · Due {task.dueDate}
                </span>
              </span>
              <span className="min-w-0">
                <span className="mb-1.5 flex justify-between text-xs font-normal text-muted">
                  <span>Progress</span>
                  <strong className="text-ink">{task.progress}%</strong>
                </span>
                <Progress
                  value={task.progress}
                  tone={task.status === "Completed" ? "green" : "purple"}
                />
              </span>
              <Badge tone={statusTone(task.status)}>{task.status}</Badge>
              <Icon name="arrow" className="size-4 text-muted" />
            </Button>
          ))}
          {visibleTasks.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-neutral-100 text-muted">
                <Icon name="tasks" />
              </div>
              <div className="mt-3 text-sm font-semibold">
                No matching tasks
              </div>
              <div className="mt-1 text-xs text-muted">
                Try adjusting your search or status filter.
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedTask && (
        <Modal onClose={() => setSelectedTaskId(null)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone={statusTone(selectedTask.status)}>
                {selectedTask.status}
              </Badge>
              <div
                className={`mt-3 text-xl font-semibold tracking-tight ${
                  selectedTask.status === "Completed"
                    ? "text-muted line-through"
                    : "text-ink"
                }`}
              >
                {selectedTask.name}
              </div>
            </div>
            <Button
              variant="ghost"
              className="icon-button"
              onClick={() => setSelectedTaskId(null)}
            >
              <Icon name="close" className="size-4" />
            </Button>
          </div>
          <div className="mt-3 text-sm leading-6 text-muted">
            {selectedTask.description}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border py-4">
            <TaskDetail
              label="Related goal"
              value={`${selectedTask.relatedGoal} · ${selectedTaskGoal?.progress ?? 0}%`}
            />
            <TaskDetail
              label="MIRAI stage"
              value={selectedTask.miraiStage ?? "Not applicable"}
            />
            <TaskDetail label="Assigned by" value={selectedTask.assignedBy} />
            <TaskDetail label="Due date" value={selectedTask.dueDate} />
            <TaskDetail label="Priority" value={selectedTask.priority} />
            <TaskDetail label="Current status" value={selectedTask.status} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Current progress</span>
              <span className="font-semibold text-purple-700">
                {selectedTask.progress}%
              </span>
            </div>
            <Progress
              value={selectedTask.progress}
              tone={selectedTask.status === "Completed" ? "green" : "purple"}
            />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              disabled={selectedTask.status === "Completed"}
              onClick={() =>
                updateTaskProgress(
                  selectedTask.id,
                  Math.min(100, selectedTask.progress + 10),
                )
              }
            >
              <Icon name="chart" className="size-4" /> Update progress
            </Button>
            <Button
              disabled={
                selectedTask.progress < 100 ||
                selectedTask.status === "Completed"
              }
              onClick={() => setTaskCompleted(selectedTask.id, true)}
            >
              <Icon name="check" className="size-4" /> Mark as complete
            </Button>
          </div>
          {selectedTask.progress < 100 &&
            selectedTask.status !== "Completed" && (
              <div className="mt-3 text-right text-xs text-muted">
                Progress must reach 100% before completion.
              </div>
            )}
        </Modal>
      )}
    </>
  )
}

function TaskDetail({ label, value }: { label: string value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  )
}

function GoalPage({
  goals,
  tasks,
  addGoal,
  updateGoal,
  deleteGoal,
}: {
  goals: EmployeeGoal[]
  tasks: EmployeeTask[]
  addGoal: (goal: EmployeeGoal) => void
  updateGoal: (
    goalId: string,
    updates: Partial<EmployeeGoal>,
    progressNote?: string,
  ) => void
  deleteGoal: (goalId: string) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [sourceFilter, setSourceFilter] = useState("All goals")
  const [sortBy, setSortBy] = useState("Priority")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [descriptionDraft, setDescriptionDraft] = useState("")
  const [categoryDraft, setCategoryDraft] = useState("Development")
  const [dueDateDraft, setDueDateDraft] = useState("")
  const [progressDraft, setProgressDraft] = useState("0")
  const [progressNote, setProgressNote] = useState("")
  const priorityOrder: Record<TaskPriority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  }
  const statusTone = (status: TaskStatus): "purple" | "neutral" | "green" =>
    status === "Needs Action" || status === "In Progress"
      ? "purple"
      : status === "Upcoming"
        ? "neutral"
        : "green"
  const visibleGoals = [...goals]
    .filter((goal) => goal.title.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (goal) => statusFilter === "All statuses" || goal.status === statusFilter,
    )
    .filter(
      (goal) => sourceFilter === "All goals" || goal.source === sourceFilter,
    )
    .sort((first, second) => {
      if (sortBy === "Progress") return second.progress - first.progress
      if (sortBy === "Due date")
        return first.dueDate.localeCompare(second.dueDate)
      return priorityOrder[first.priority] - priorityOrder[second.priority]
    })
  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? null
  const relatedTasks = selectedGoal
    ? tasks.filter((task) => selectedGoal.relatedTaskIds.includes(task.id))
    : []

  const openGoal = (goal: EmployeeGoal) => {
    setSelectedGoalId(goal.id)
    setProgressDraft(String(goal.progress))
    setProgressNote("")
    setProgressOpen(false)
    setEditOpen(false)
  }
  const savePersonalGoal = () => {
    if (!titleDraft.trim()) return
    addGoal({
      id: `personal-${Date.now()}`,
      title: titleDraft.trim(),
      description: descriptionDraft.trim() || "Personal development goal.",
      category: categoryDraft,
      source: "Personal development",
      assignedBy: "Self",
      startDate: "Today",
      dueDate: dueDateDraft.trim() || "Not set",
      priority: "Medium",
      progress: 0,
      status: "Upcoming",
      relatedTaskIds: [],
      latestProgressUpdate: "Personal development goal created.",
    })
    setTitleDraft("")
    setDescriptionDraft("")
    setDueDateDraft("")
    setAddOpen(false)
  }
  const beginEdit = () => {
    if (!selectedGoal || selectedGoal.source !== "Personal development") return
    setTitleDraft(selectedGoal.title)
    setDescriptionDraft(selectedGoal.description)
    setCategoryDraft(selectedGoal.category)
    setDueDateDraft(selectedGoal.dueDate)
    setEditOpen(true)
  }
  const saveEdit = () => {
    if (!selectedGoal || !titleDraft.trim()) return
    updateGoal(selectedGoal.id, {
      title: titleDraft.trim(),
      description: descriptionDraft.trim(),
      category: categoryDraft,
      dueDate: dueDateDraft.trim() || selectedGoal.dueDate,
    })
    setEditOpen(false)
  }
  const saveGoalProgress = () => {
    if (!selectedGoal) return
    const progress = Number(progressDraft)
    updateGoal(
      selectedGoal.id,
      {
        progress,
        status: progress === 100 ? "Completed" : "In Progress",
      },
      progressNote.trim() || `Progress updated to ${progress}%.`,
    )
    setProgressOpen(false)
  }

  return (
    <>
      <PageIntro
        eyebrow="Performance"
        title="My goals"
        copy="Track official outcomes and your personal development in one focused view."
        action={
          <Button
            onClick={() => {
              setTitleDraft("")
              setDescriptionDraft("")
              setCategoryDraft("Development")
              setDueDateDraft("")
              setAddOpen(true)
            }}
          >
            <Icon name="plus" className="size-4" /> Add personal development
            goal
          </Button>
        }
      />
      <Card>
        <div className="grid gap-3 border-b border-border pb-5 lg:grid-cols-[1fr_10rem_12rem_10rem]">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search my goals"
              className="w-full pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter goal status"
          >
            <option>All statuses</option>
            <option>Needs Action</option>
            <option>In Progress</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </Select>
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            ariaLabel="Filter goal source"
          >
            <option>All goals</option>
            <option>Mentor assigned</option>
            <option>Personal development</option>
          </Select>
          <Select value={sortBy} onChange={setSortBy} ariaLabel="Sort goals">
            <option value="Priority">Sort: Priority</option>
            <option value="Due date">Sort: Due date</option>
            <option value="Progress">Sort: Progress</option>
          </Select>
        </div>
        <div className="mt-2">
          {visibleGoals.map((goal) => (
            <Button
              key={goal.id}
              variant="ghost"
              className="goal-list-row"
              onClick={() => openGoal(goal)}
            >
              <span
                className={`goal-icon ${
                  goal.status === "Completed" ? "goal-icon-complete" : ""
                }`}
              >
                <Icon
                  name={goal.status === "Completed" ? "check" : "target"}
                  className="size-4"
                />
              </span>
              <span className="min-w-0 text-left">
                <span
                  className={`block text-sm font-semibold ${
                    goal.status === "Completed"
                      ? "text-muted line-through"
                      : "text-ink"
                  }`}
                >
                  {goal.title}
                </span>
                <span className="mt-1 block text-xs font-normal text-muted">
                  {goal.category} · {goal.source}
                </span>
              </span>
              <span className="min-w-0">
                <span className="mb-1.5 flex justify-between text-xs font-normal text-muted">
                  <span>Progress</span>
                  <strong className="text-ink">{goal.progress}%</strong>
                </span>
                <Progress
                  value={goal.progress}
                  tone={goal.status === "Completed" ? "green" : "purple"}
                />
              </span>
              <Badge tone={statusTone(goal.status)}>{goal.status}</Badge>
              <Icon name="arrow" className="size-4 text-muted" />
            </Button>
          ))}
          {visibleGoals.length === 0 && (
            <div className="py-12 text-center text-sm text-muted">
              No goals match the selected filters.
            </div>
          )}
        </div>
      </Card>

      {selectedGoal && (
        <Modal onClose={() => setSelectedGoalId(null)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={statusTone(selectedGoal.status)}>
                  {selectedGoal.status}
                </Badge>
                <Badge
                  tone={
                    selectedGoal.source === "Mentor assigned"
                      ? "blue"
                      : "purple"
                  }
                >
                  {selectedGoal.source === "Mentor assigned"
                    ? "Assigned by Mentor"
                    : "Personal development"}
                </Badge>
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight">
                {selectedGoal.title}
              </div>
            </div>
            <Button
              variant="ghost"
              className="icon-button"
              onClick={() => setSelectedGoalId(null)}
            >
              <Icon name="close" className="size-4" />
            </Button>
          </div>
          {!editOpen ? (
            <>
              <div className="mt-3 text-sm leading-6 text-muted">
                {selectedGoal.description}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border py-4">
                <TaskDetail label="Category" value={selectedGoal.category} />
                <TaskDetail label="Goal source" value={selectedGoal.source} />
                <TaskDetail
                  label="Assigned by"
                  value={
                    selectedGoal.source === "Mentor assigned"
                      ? selectedGoal.assignedBy
                      : "Self"
                  }
                />
                <TaskDetail label="Start date" value={selectedGoal.startDate} />
                <TaskDetail label="Due date" value={selectedGoal.dueDate} />
                <TaskDetail
                  label="Current status"
                  value={selectedGoal.status}
                />
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-semibold">Current progress</span>
                  <strong>{selectedGoal.progress}%</strong>
                </div>
                <Progress
                  value={selectedGoal.progress}
                  tone={
                    selectedGoal.status === "Completed" ? "green" : "purple"
                  }
                />
                <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs leading-5 text-muted">
                  <strong className="text-ink">Latest update:</strong>{" "}
                  {selectedGoal.latestProgressUpdate}
                </div>
              </div>
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Related tasks
                </div>
                <div className="mt-2 space-y-2">
                  {relatedTasks.length > 0 ? (
                    relatedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={`grid size-5 place-items-center rounded-full border ${
                            task.status === "Completed"
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-border"
                          }`}
                        >
                          {task.status === "Completed" && (
                            <Icon name="check" className="size-3" />
                          )}
                        </span>
                        <span
                          className={
                            task.status === "Completed"
                              ? "text-muted line-through"
                              : "text-ink"
                          }
                        >
                          {task.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted">
                      No related tasks yet.
                    </div>
                  )}
                </div>
              </div>
              {progressOpen ? (
                <div className="mt-5 rounded-xl bg-neutral-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Progress percentage</span>
                      <Select
                        value={progressDraft}
                        onChange={setProgressDraft}
                        ariaLabel="Goal progress"
                      >
                        {[0, 10, 25, 43, 50, 58, 68, 76, 80, 90, 100].map(
                          (value) => (
                            <option key={value} value={value}>
                              {value}%
                            </option>
                          ),
                        )}
                      </Select>
                    </label>
                    <label>
                      <span className="field-label">Progress note</span>
                      <TextInput
                        value={progressNote}
                        onChange={setProgressNote}
                        placeholder="Add a short update"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setProgressOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveGoalProgress}>Save update</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  {selectedGoal.source === "Personal development" && (
                    <Button variant="secondary" onClick={beginEdit}>
                      <Icon name="edit" className="size-4" /> Edit goal
                    </Button>
                  )}
                  {selectedGoal.source === "Personal development" && (
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => {
                        deleteGoal(selectedGoal.id)
                        setSelectedGoalId(null)
                      }}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setProgressDraft(String(selectedGoal.progress))
                      setProgressNote("")
                      setProgressOpen(true)
                    }}
                  >
                    <Icon name="chart" className="size-4" /> Update progress
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="field-label">Goal title</span>
                <TextInput value={titleDraft} onChange={setTitleDraft} />
              </label>
              <label className="block">
                <span className="field-label">Description</span>
                <TextInput
                  value={descriptionDraft}
                  onChange={setDescriptionDraft}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Category</span>
                  <TextInput
                    value={categoryDraft}
                    onChange={setCategoryDraft}
                  />
                </label>
                <label>
                  <span className="field-label">Due date</span>
                  <TextInput value={dueDateDraft} onChange={setDueDateDraft} />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>Save changes</Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {addOpen && (
        <Modal onClose={() => setAddOpen(false)}>
          <SectionTitle
            title="Add personal development goal"
            eyebrow="Personal development"
          />
          <div className="space-y-4">
            <label className="block">
              <span className="field-label">Goal title</span>
              <TextInput
                value={titleDraft}
                onChange={setTitleDraft}
                placeholder="What would you like to develop?"
              />
            </label>
            <label className="block">
              <span className="field-label">Description</span>
              <TextInput
                value={descriptionDraft}
                onChange={setDescriptionDraft}
                placeholder="Describe the intended outcome"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Category</span>
                <TextInput value={categoryDraft} onChange={setCategoryDraft} />
              </label>
              <label>
                <span className="field-label">Due date</span>
                <TextInput
                  value={dueDateDraft}
                  onChange={setDueDateDraft}
                  placeholder="e.g. Dec 15, 2025"
                />
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePersonalGoal}>Create goal</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function EmployeePage({
  page,
  reviewCycle,
  goals,
  tasks,
  addGoal,
  updateGoal,
  deleteGoal,
  updateTaskProgress,
  setTaskCompleted,
}: {
  page: string
  reviewCycle: ReviewCycle | null
  goals: EmployeeGoal[]
  tasks: EmployeeTask[]
  addGoal: (goal: EmployeeGoal) => void
  updateGoal: (
    goalId: string,
    updates: Partial<EmployeeGoal>,
    progressNote?: string,
  ) => void
  deleteGoal: (goalId: string) => void
  updateTaskProgress: (taskId: string, progress: number) => void
  setTaskCompleted: (taskId: string, completed: boolean) => void
}) {
  if (page === "MIRAI Journey")
    return (
      <>
        <PageIntro
          eyebrow="Growth framework"
          title="Your MIRAI Journey"
          copy="A year-long rhythm for mapping ambition, learning deeply, rising through feedback, and advancing your impact."
        />
        <MiraiJourney />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <SectionTitle title="Q3 milestones" />
            <ActionItem
              title="Midpoint reflection"
              meta="In progress · Due Sep 18"
              tone="amber"
            />
            <div className="mt-3">
              <ActionItem
                title="Peer feedback exchange"
                meta="Completed Sep 12"
                tone="green"
              />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Growth focus" />
            <GoalRow
              title="Facilitation confidence"
              category="Lead 3 research sessions"
              progress={66}
            />
            <GoalRow
              title="Evidence-led storytelling"
              category="Present 2 product readouts"
              progress={50}
            />
          </Card>
        </div>
      </>
    )
  if (page === "Performance Reviews")
    return <ReviewDetail cycle={reviewCycle} />
  if (page === "My Goals")
    return (
      <GoalPage
        goals={goals}
        tasks={tasks}
        addGoal={addGoal}
        updateGoal={updateGoal}
        deleteGoal={deleteGoal}
      />
    )
  if (page === "My Tasks")
    return (
      <TaskPage
        tasks={tasks}
        goals={goals}
        updateTaskProgress={updateTaskProgress}
        setTaskCompleted={setTaskCompleted}
      />
    )
  if (page === "Reminders")
    return (
      <ListPage
        title="Reminders"
        eyebrow="Attention"
        copy="Deadlines and actions that need your attention."
        kind="reminders"
      />
    )
  return <ProfilePage role="employee" />
}

function ListPage({
  title,
  eyebrow,
  copy,
  kind,
  progress = 62,
  action,
}: {
  title: string
  eyebrow: string
  copy: string
  kind: "goals" | "tasks" | "reminders"
  progress?: number
  action?: () => void
}) {
  const rows =
    kind === "goals"
      ? [
          ["Improve onboarding research quality", "Customer insight", "76"],
          ["Build design system fluency", "Capability", "58"],
          ["Contribute to mobile product launch", "Business impact", "43"],
          ["Strengthen facilitation confidence", "Development", "66"],
        ]
      : kind === "tasks"
        ? [
            [
              "Complete midpoint reflection",
              "MIRAI · Due Sep 18",
              String(progress),
            ],
            ["Synthesize onboarding interviews", "Goal · Due Sep 20", "80"],
            ["Prepare mobile launch critique", "Team · Due Sep 24", "40"],
            ["Complete accessibility module", "Learning · Due Sep 28", "25"],
          ]
        : [
            ["Midpoint reflection due", "Sep 18 · High priority", "20"],
            ["Research goal update", "Sep 22 · Medium priority", "45"],
            ["Mentor check-in", "Sep 25 · Scheduled", "70"],
            ["Learning plan review", "Oct 02 · Upcoming", "10"],
          ]
  return (
    <>
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        copy={copy}
        action={
          kind !== "reminders" ? (
            <Button onClick={action}>
              <Icon
                name={kind === "goals" ? "plus" : "check"}
                className="size-4"
              />{" "}
              {kind === "goals" ? "Add personal goal" : "Complete next task"}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              placeholder={`Search ${title.toLowerCase()}`}
              className="w-full pl-9"
            />
          </div>
          <Button variant="secondary">All statuses</Button>
          <Button variant="secondary">Sort: Priority</Button>
        </div>
        <div className="divide-y divide-border">
          {rows.map((row, index) => (
            <div
              key={row[0]}
              className="grid gap-4 py-5 md:grid-cols-[1fr_12rem_7rem] md:items-center"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 grid size-9 shrink-0 place-items-center rounded-lg ${
                    index === 0
                      ? "bg-purple-100 text-purple-700"
                      : "bg-neutral-100 text-muted"
                  }`}
                >
                  <Icon
                    name={
                      kind === "goals"
                        ? "target"
                        : kind === "tasks"
                          ? "tasks"
                          : "bell"
                    }
                    className="size-4"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold">{row[0]}</div>
                  <div className="mt-1 text-xs text-muted">{row[1]}</div>
                </div>
              </div>
              <div>
                <Progress value={Number(row[2])} />
              </div>
              <Badge
                tone={
                  index === 0 ? "amber" : index === 3 ? "neutral" : "purple"
                }
              >
                {index === 0
                  ? "Needs action"
                  : index === 3
                    ? "Upcoming"
                    : "In progress"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

type HREmployee = {
  id: string
  name: string
  email: string
  initials: string
  cohort: string
  mentor: string
  section: string
  subSection: string
  status: "Active" | "Deactivated"
  miraiStage: string
  performance: "Achieved" | "Progressing" | "Focus Required"
  goalProgress: number
  reviewStatus: string
  evidence: string
}

function HREmployeesPage() {
  const [employees, setEmployees] = useState<HREmployee[]>([
    {
      id: "EMP001",
      name: "Alex Morgan",
      email: "alex.morgan@dailoqa.com",
      initials: "AM",
      cohort: "2025",
      mentor: "Daniel Ortiz",
      section: "A",
      subSection: "A1",
      status: "Active",
      miraiStage: "Q3 · Rise",
      performance: "Progressing",
      goalProgress: 76,
      reviewStatus: "Pending HR Review",
      evidence: "4 items submitted",
    },
    {
      id: "EMP002",
      name: "Maya Chen",
      email: "maya.chen@dailoqa.com",
      initials: "MC",
      cohort: "2025",
      mentor: "Daniel Ortiz",
      section: "B",
      subSection: "B2",
      status: "Active",
      miraiStage: "Q3 · Rise",
      performance: "Achieved",
      goalProgress: 84,
      reviewStatus: "Submitted to HR",
      evidence: "6 items submitted",
    },
    {
      id: "EMP003",
      name: "Noah Williams",
      email: "noah.williams@dailoqa.com",
      initials: "NW",
      cohort: "2025",
      mentor: "Priya Rao",
      section: "C",
      subSection: "C1",
      status: "Active",
      miraiStage: "Q2 · Immerse",
      performance: "Progressing",
      goalProgress: 68,
      reviewStatus: "Ready to submit",
      evidence: "3 items submitted",
    },
    {
      id: "EMP004",
      name: "Priya Rao",
      email: "priya.rao@dailoqa.com",
      initials: "PR",
      cohort: "2025",
      mentor: "Daniel Ortiz",
      section: "D",
      subSection: "D2",
      status: "Active",
      miraiStage: "Q3 · Rise",
      performance: "Focus Required",
      goalProgress: 54,
      reviewStatus: "Evaluation in progress",
      evidence: "2 items submitted",
    },
    {
      id: "EMP005",
      name: "Leah Kim",
      email: "leah.kim@dailoqa.com",
      initials: "LK",
      cohort: "2025",
      mentor: "Priya Rao",
      section: "A",
      subSection: "A2",
      status: "Active",
      miraiStage: "Q4 · Advance",
      performance: "Achieved",
      goalProgress: 91,
      reviewStatus: "Published",
      evidence: "8 items submitted",
    },
  ])

  const [search, setSearch] = useState("")
  const [employeeFilterOpen, setEmployeeFilterOpen] = useState(false)
  const [cohortFilter, setCohortFilter] = useState("All")
  const [mentorFilter, setMentorFilter] = useState("All")
  const [sectionFilter, setSectionFilter] = useState("All")
  const [subSectionFilter, setSubSectionFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const activeEmployeeFilters = [
    {
      key: "cohort",
      label: "Cohort",
      value: cohortFilter,
      clear: () => setCohortFilter("All"),
    },
    {
      key: "mentor",
      label: "Mentor",
      value: mentorFilter,
      clear: () => setMentorFilter("All"),
    },
    {
      key: "section",
      label: "Section",
      value: sectionFilter,
      clear: () => {
        setSectionFilter("All")
        setSubSectionFilter("All")
      },
    },
    {
      key: "subsection",
      label: "Sub-section",
      value: subSectionFilter,
      clear: () => setSubSectionFilter("All"),
    },
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      clear: () => setStatusFilter("All"),
    },
  ].filter((filter) => filter.value !== "All")

  const [selectedEmployee, setSelectedEmployee] = useState<HREmployee | null>(
    null,
  )
  const [employeeMenu, setEmployeeMenu] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const [nameDraft, setNameDraft] = useState("")
  const [emailDraft, setEmailDraft] = useState("")
  const [cohortDraft, setCohortDraft] = useState("2025")
  const [mentorDraft, setMentorDraft] = useState("Daniel Ortiz")
  const [sectionDraft, setSectionDraft] = useState("A")
  const [subSectionDraft, setSubSectionDraft] = useState("A1")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const mentors = ["Daniel Ortiz", "Priya Rao", "Unassigned"]
  const sections = ["A", "B", "C", "D"]
  const subSections = ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"]

  const visibleEmployees = employees.filter((employee) => {
    const matchesSearch = `${employee.name} ${employee.email} ${employee.id}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCohort =
      cohortFilter === "All" || employee.cohort === cohortFilter

    const matchesMentor =
      mentorFilter === "All" || employee.mentor === mentorFilter

    const matchesSection =
      sectionFilter === "All" || employee.section === sectionFilter

    const matchesSubSection =
      subSectionFilter === "All" || employee.subSection === subSectionFilter

    const matchesStatus =
      statusFilter === "All" || employee.status === statusFilter

    return (
      matchesSearch &&
      matchesCohort &&
      matchesMentor &&
      matchesSection &&
      matchesSubSection &&
      matchesStatus
    )
  })

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length
  const deactivatedCount = employees.filter(
    (employee) => employee.status === "Deactivated",
  ).length
  const averageProgress =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, employee) => sum + employee.goalProgress, 0) /
            employees.length,
        )
      : 0

  const performanceTone = (
    performance: HREmployee["performance"],
  ): "green" | "purple" | "red" => {
    if (performance === "Achieved") return "green"
    if (performance === "Focus Required") return "red"
    return "purple"
  }

  const reviewTone = (
    review: string,
  ): "green" | "blue" | "amber" | "purple" => {
    if (review === "Published") return "green"
    if (review === "Submitted to HR") return "blue"
    if (review === "Pending HR Review") return "amber"
    return "purple"
  }

  const resetEmployeeDrafts = () => {
    setNameDraft("")
    setEmailDraft("")
    setCohortDraft("2025")
    setMentorDraft("Daniel Ortiz")
    setSectionDraft("A")
    setSubSectionDraft("A1")
  }

  const addEmployee = () => {
    if (!nameDraft.trim() || !emailDraft.trim()) return

    const nameParts = nameDraft.trim().split(" ")
    const initials = nameParts
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const newEmployee: HREmployee = {
      id: `EMP${String(employees.length + 1).padStart(3, "0")}`,
      name: nameDraft.trim(),
      email: emailDraft.trim(),
      initials,
      cohort: cohortDraft,
      mentor: mentorDraft,
      section: sectionDraft,
      subSection: subSectionDraft,
      status: "Active",
      miraiStage: "Q1 · Map",
      performance: "Progressing",
      goalProgress: 0,
      reviewStatus: "Not started",
      evidence: "0 items submitted",
    }

    setEmployees((current) => [...current, newEmployee])
    setAddOpen(false)
    resetEmployeeDrafts()
  }

  const toggleEmployeeStatus = (id: string) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              status: employee.status === "Active" ? "Deactivated" : "Active",
            }
          : employee,
      ),
    )

    if (selectedEmployee?.id === id) {
      setSelectedEmployee((current) =>
        current
          ? {
              ...current,
              status: current.status === "Active" ? "Deactivated" : "Active",
            }
          : null,
      )
    }
  }

  const updateEmployeeMentor = (id: string, mentor: string) => {
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === id ? { ...employee, mentor } : employee,
      ),
    )

    setSelectedEmployee((current) =>
      current && current.id === id ? { ...current, mentor } : current,
    )
  }

  const handleCSVImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      const text = String(reader.result ?? "")
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      if (lines.length < 2) return

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim().toLowerCase())

      const imported: HREmployee[] = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((value) => value.trim())

        const get = (name: string) => {
          const position = headers.indexOf(name)
          return position >= 0 ? (values[position] ?? "") : ""
        }

        const name = get("name") || `Imported Employee ${index + 1}`
        const email = get("email") || `employee${index + 1}@dailoqa.com`
        const initials = name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()

        return {
          id: `CSV${Date.now()}${index}`,
          name,
          email,
          initials,
          cohort: get("cohort") || "2025",
          mentor: get("mentor") || "Unassigned",
          section: get("section") || "A",
          subSection: get("subsection") || "A1",
          status: get("status") === "Deactivated" ? "Deactivated" : "Active",
          miraiStage: get("mirai stage") || "Q1 · Map",
          performance: "Progressing",
          goalProgress: Number(get("goal progress")) || 0,
          reviewStatus: "Not started",
          evidence: "0 items submitted",
        }
      })

      setEmployees((current) => [...current, ...imported])
      setImportOpen(false)
    }

    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <>
      <PageIntro
        eyebrow="HR"
        title="Employees"
        copy="Add, manage, assign, and monitor employees and interns across the organization."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              Import CSV
            </Button>
            <Button
              onClick={() => {
                resetEmployeeDrafts()
                setAddOpen(true)
              }}
            >
              <Icon name="plus" className="size-4" />
              Add employee
            </Button>
          </div>
        }
      />

      <Card>
        {/* Compact search + filters */}
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search employees"
              className="w-full pl-9"
            />
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setEmployeeFilterOpen(!employeeFilterOpen)}
            >
              <Icon name="settings" className="size-4" /> Filter
              {activeEmployeeFilters.length > 0 && (
                <Badge tone="purple">{activeEmployeeFilters.length}</Badge>
              )}
            </Button>
            {employeeFilterOpen && (
              <Card className="absolute right-0 top-12 z-30 w-80 p-4 shadow-xl">
                <div className="mb-3 text-sm font-semibold">
                  Filter employees
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="field-label">Cohort</span>
                    <Select
                      value={cohortFilter}
                      onChange={setCohortFilter}
                      ariaLabel="Filter by cohort"
                    >
                      <option value="All">All</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Mentor</span>
                    <Select
                      value={mentorFilter}
                      onChange={setMentorFilter}
                      ariaLabel="Filter by mentor"
                    >
                      <option value="All">All</option>
                      {mentors.map((mentor) => (
                        <option key={mentor}>{mentor}</option>
                      ))}
                    </Select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      <span className="field-label">Section</span>
                      <Select
                        value={sectionFilter}
                        onChange={(value) => {
                          setSectionFilter(value)
                          setSubSectionFilter("All")
                        }}
                        ariaLabel="Filter by section"
                      >
                        <option value="All">All</option>
                        {sections.map((section) => (
                          <option key={section}>{section}</option>
                        ))}
                      </Select>
                    </label>
                    <label>
                      <span className="field-label">Sub-section</span>
                      <Select
                        value={subSectionFilter}
                        onChange={setSubSectionFilter}
                        ariaLabel="Filter by sub-section"
                      >
                        <option value="All">All</option>
                        {(sectionFilter === "All"
                          ? subSections
                          : [`${sectionFilter}1`, `${sectionFilter}2`]
                        ).map((subSection) => (
                          <option key={subSection}>{subSection}</option>
                        ))}
                      </Select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="field-label">Status</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      ariaLabel="Filter by employee status"
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="Deactivated">Deactivated</option>
                    </Select>
                  </label>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCohortFilter("All")
                      setMentorFilter("All")
                      setSectionFilter("All")
                      setSubSectionFilter("All")
                      setStatusFilter("All")
                    }}
                  >
                    Clear all
                  </Button>
                  <Button onClick={() => setEmployeeFilterOpen(false)}>
                    Apply filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {activeEmployeeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border py-3">
            {activeEmployeeFilters.map((filter) => (
              <div key={filter.key} className="skill-pill">
                <span>
                  {filter.label}: {filter.value}
                </span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={filter.clear}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Employee list */}
        <div className="mt-2">
          {visibleEmployees.map((employee) => (
            <div
              key={employee.id}
              className="grid gap-3 border-b border-border py-3 last:border-0 lg:grid-cols-[minmax(15rem,1.6fr)_6rem_9rem_7rem_10rem_auto] lg:items-center"
            >
              {/* Employee */}
              <button
                type="button"
                className="flex min-w-0 items-center gap-3 text-left"
                onClick={() => setSelectedEmployee(employee)}
              >
                <Avatar initials={employee.initials} small />

                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {employee.name}
                  </span>

                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {employee.email} · {employee.id}
                  </span>
                </span>
              </button>

              {/* Cohort */}
              <div>
                <div className="text-[11px] text-muted">Cohort</div>
                <div className="mt-0.5 text-sm font-medium">
                  {employee.cohort}
                </div>
              </div>

              {/* Mentor */}
              <div>
                <div className="text-[11px] text-muted">Mentor</div>
                <div className="mt-0.5 truncate text-sm font-medium">
                  {employee.mentor}
                </div>
              </div>

              {/* Section */}
              <div>
                <div className="text-[11px] text-muted">Section</div>
                <div className="mt-0.5 text-sm font-medium">
                  {employee.section} · {employee.subSection}
                </div>
              </div>

              {/* Goal progress */}
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                  <span>Goal progress</span>
                  <strong className="text-ink">{employee.goalProgress}%</strong>
                </div>

                <Progress value={employee.goalProgress} />
              </div>

              {/* Status + actions */}
              <div className="flex items-center justify-end gap-2">
                <Badge
                  tone={employee.status === "Active" ? "green" : "neutral"}
                >
                  {employee.status}
                </Badge>

                <div className="relative">
                  <Button
                    variant="ghost"
                    className="icon-button"
                    onClick={() =>
                      setEmployeeMenu(
                        employeeMenu === employee.id ? null : employee.id,
                      )
                    }
                  >
                    <Icon name="more" />
                  </Button>

                  {employeeMenu === employee.id && (
                    <div className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        View profile
                      </button>

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        Edit employee
                      </button>

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        Assign mentor
                      </button>

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        View goals
                      </button>

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        View evidence
                      </button>

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setEmployeeMenu(null)
                        }}
                      >
                        View performance history
                      </button>

                      <div className="my-1 border-t border-border" />

                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50"
                        onClick={() => {
                          toggleEmployeeStatus(employee.id)
                          setEmployeeMenu(null)
                        }}
                      >
                        {employee.status === "Active"
                          ? "Deactivate employee"
                          : "Activate employee"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {visibleEmployees.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-neutral-100 text-muted">
                <Icon name="users" />
              </div>

              <div className="mt-3 text-sm font-semibold">
                No employees found
              </div>

              <div className="mt-1 text-xs text-muted">
                Try changing your search or filters.
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Active employees</div>
          <div className="mt-1 text-2xl font-semibold">{activeCount}</div>
          <div className="mt-1 text-xs text-muted">Currently participating</div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Deactivated</div>
          <div className="mt-1 text-2xl font-semibold">{deactivatedCount}</div>
          <div className="mt-1 text-xs text-muted">
            Accounts not currently active
          </div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Average goal progress</div>
          <div className="mt-1 text-2xl font-semibold">{averageProgress}%</div>
          <div className="mt-3">
            <Progress value={averageProgress} />
          </div>
        </Card>
      </div>

      {selectedEmployee && (
        <Modal onClose={() => setSelectedEmployee(null)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar initials={selectedEmployee.initials} />
              <div>
                <div className="text-xl font-semibold tracking-tight">
                  {selectedEmployee.name}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {selectedEmployee.email}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="icon-button"
              onClick={() => setSelectedEmployee(null)}
            >
              <Icon name="close" className="size-4" />
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="stat-tile">
              <span>Employee ID</span>
              <strong>{selectedEmployee.id}</strong>
            </div>
            <div className="stat-tile">
              <span>Cohort</span>
              <strong>{selectedEmployee.cohort}</strong>
            </div>
            <div className="stat-tile">
              <span>Section</span>
              <strong>
                {selectedEmployee.section} · {selectedEmployee.subSection}
              </strong>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Card className="bg-neutral-50">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                Mentor assignment
              </div>
              <div className="mt-3">
                <Select
                  value={selectedEmployee.mentor}
                  onChange={(value) =>
                    updateEmployeeMentor(selectedEmployee.id, value)
                  }
                  ariaLabel="Assign mentor"
                >
                  {mentors.map((mentor) => (
                    <option key={mentor}>{mentor}</option>
                  ))}
                </Select>
              </div>
            </Card>

            <Card className="bg-neutral-50">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                MIRAI Journey
              </div>
              <div className="mt-2 text-lg font-semibold">
                {selectedEmployee.miraiStage}
              </div>
              <div className="mt-3">
                <Progress value={selectedEmployee.goalProgress} />
              </div>
            </Card>
          </div>

          <div className="mt-5">
            <SectionTitle
              title="Performance"
              action={
                <Badge tone={performanceTone(selectedEmployee.performance)}>
                  {selectedEmployee.performance}
                </Badge>
              }
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat-tile">
                <span>Goal progress</span>
                <strong>{selectedEmployee.goalProgress}%</strong>
              </div>

              <div className="stat-tile">
                <span>Review status</span>
                <strong>{selectedEmployee.reviewStatus}</strong>
              </div>

              <div className="stat-tile">
                <span>Evidence</span>
                <strong>{selectedEmployee.evidence}</strong>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <SectionTitle title="Performance history" />

            <div className="divide-y divide-border rounded-xl border border-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-semibold">
                    2025 Mid-Year Review
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {selectedEmployee.reviewStatus}
                  </div>
                </div>
                <Badge tone={reviewTone(selectedEmployee.reviewStatus)}>
                  {selectedEmployee.reviewStatus}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-semibold">
                    Goal & evidence review
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {selectedEmployee.evidence}
                  </div>
                </div>
                <Button variant="secondary">View evidence</Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => toggleEmployeeStatus(selectedEmployee.id)}
            >
              {selectedEmployee.status === "Active"
                ? "Deactivate employee"
                : "Activate employee"}
            </Button>

            <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {addOpen && (
        <Modal onClose={() => setAddOpen(false)}>
          <SectionTitle
            title="Add employee / intern"
            eyebrow="Employee management"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="field-label">Full name</span>
              <TextInput
                value={nameDraft}
                onChange={setNameDraft}
                placeholder="e.g. Ava Robinson"
              />
            </label>

            <label>
              <span className="field-label">Email</span>
              <TextInput
                value={emailDraft}
                onChange={setEmailDraft}
                placeholder="name@company.com"
              />
            </label>

            <label>
              <span className="field-label">Cohort</span>
              <TextInput value={cohortDraft} onChange={setCohortDraft} />
            </label>

            <label>
              <span className="field-label">Mentor</span>
              <Select
                value={mentorDraft}
                onChange={setMentorDraft}
                ariaLabel="Select mentor"
              >
                {mentors.map((mentor) => (
                  <option key={mentor}>{mentor}</option>
                ))}
              </Select>
            </label>

            <label>
              <span className="field-label">Section</span>
              <Select
                value={sectionDraft}
                onChange={setSectionDraft}
                ariaLabel="Select section"
              >
                {sections.map((section) => (
                  <option key={section}>{section}</option>
                ))}
              </Select>
            </label>

            <label>
              <span className="field-label">Sub-section</span>
              <Select
                value={subSectionDraft}
                onChange={setSubSectionDraft}
                ariaLabel="Select sub-section"
              >
                {subSections.map((subSection) => (
                  <option key={subSection}>{subSection}</option>
                ))}
              </Select>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addEmployee}>Add employee</Button>
          </div>
        </Modal>
      )}

      {importOpen && (
        <Modal onClose={() => setImportOpen(false)}>
          <SectionTitle title="Import employees" eyebrow="Bulk import" />

          <div className="rounded-xl bg-neutral-50 p-5">
            <div className="text-sm font-semibold">
              Import employees from CSV
            </div>

            <div className="mt-2 text-xs leading-5 text-muted">
              CSV columns supported: name, email, cohort, mentor, section,
              subsection, status, mirai stage, goal progress.
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-white p-8 text-sm font-medium text-purple-700">
              Choose CSV file
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleCSVImport}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function HRPerformanceReviewsPage({
  cycles,
  evaluations,
  goals,
  updateEvaluation,
  updateStatus,
}: {
  cycles: ReviewCycle[]
  evaluations: MentorEvaluation[]
  goals: MentorGoal[]
  updateEvaluation: (
    evaluationId: string,
    updates: Partial<MentorEvaluation>,
  ) => void
  updateStatus: (evaluationId: string, status: EvaluationStatus) => void
}) {
  const [search, setSearch] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [cycleFilter, setCycleFilter] = useState("All")
  const [cohortFilter, setCohortFilter] = useState("All")
  const [mentorFilter, setMentorFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sectionFilter, setSectionFilter] = useState("All")
  const [subsectionFilter, setSubsectionFilter] = useState("All")
  const [classificationFilter, setClassificationFilter] = useState("All")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [evidenceOnly, setEvidenceOnly] = useState(false)
  const [hrFeedback, setHrFeedback] = useState<Record<string, string>>({})
  const selected = evaluations.find((item) => item.id === selectedId) ?? null
  const cycleName = (cycleId: string) =>
    cycles.find((cycle) => cycle.id === cycleId)?.name ?? "Unassigned cycle"
  const goalProgress = (intern: string) => {
    const internGoals = goals.filter((goal) => goal.intern === intern)
    return internGoals.length
      ? Math.round(
          internGoals.reduce((sum, goal) => sum + goal.progress, 0) /
            internGoals.length,
        )
      : 0
  }
  const displayStatus = (status: EvaluationStatus) =>
    status === "Approved"
      ? "Ready to Publish"
      : status === "Returned by HR"
        ? "Changes Requested"
        : status
  const classification = (evaluation: MentorEvaluation) => {
    const score = Number(evaluation.rating)
    if (score >= 4) return "Achieved"
    if (score >= 3 || goalProgress(evaluation.intern) >= 60)
      return "Progressing"
    return "Focus Required"
  }
  const statusTone = (
    status: string,
  ): "neutral" | "blue" | "amber" | "purple" | "green" =>
    status === "Published"
      ? "green"
      : status === "Ready to Publish"
        ? "purple"
        : status === "Changes Requested"
          ? "amber"
          : status === "Submitted to HR" || status === "Pending HR Review"
            ? "blue"
            : "neutral"
  const classTone = (
    value: string,
  ): "green" | "purple" | "amber" =>
    value === "Achieved"
      ? "green"
      : value === "Progressing"
        ? "purple"
        : "amber"
  const visibleReviews = evaluations.filter((evaluation) => {
    const reviewStatus = displayStatus(evaluation.status)
    const reviewClassification = classification(evaluation)
    return (
      `${evaluation.intern} ${evaluation.mentor}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (cycleFilter === "All" || evaluation.cycleId === cycleFilter) &&
      (cohortFilter === "All" || cohortFilter === "2025") &&
      (mentorFilter === "All" || evaluation.mentor === mentorFilter) &&
      (statusFilter === "All" || reviewStatus === statusFilter) &&
      (sectionFilter === "All" ||
        evaluation.section.includes(`Section ${sectionFilter}`)) &&
      (subsectionFilter === "All" ||
        evaluation.section.endsWith(`· ${subsectionFilter}`)) &&
      (classificationFilter === "All" ||
        reviewClassification === classificationFilter)
    )
  })
  const activeReviewFilters = [
    {
      key: "cycle",
      label: "Cycle",
      value: cycleFilter,
      clear: () => setCycleFilter("All"),
    },
    {
      key: "cohort",
      label: "Cohort",
      value: cohortFilter,
      clear: () => setCohortFilter("All"),
    },
    {
      key: "mentor",
      label: "Mentor",
      value: mentorFilter,
      clear: () => setMentorFilter("All"),
    },
    {
      key: "section",
      label: "Section",
      value: sectionFilter,
      clear: () => {
        setSectionFilter("All")
        setSubsectionFilter("All")
      },
    },
    {
      key: "subsection",
      label: "Sub-section",
      value: subsectionFilter,
      clear: () => setSubsectionFilter("All"),
    },
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      clear: () => setStatusFilter("All"),
    },
    {
      key: "classification",
      label: "Outcome",
      value: classificationFilter,
      clear: () => setClassificationFilter("All"),
    },
  ].filter((filter) => filter.value !== "All")
  const openReview = (evaluationId: string, evidence = false) => {
    setSelectedId(evaluationId)
    setEvidenceOnly(evidence)
    setMenuId(null)
  }
  const saveFeedback = () => {
    if (!selected) return
    updateEvaluation(selected.id, {
      overallFeedback:
        hrFeedback[selected.id]?.trim() || selected.overallFeedback,
    })
  }
  const selectedGoals = selected
    ? goals.filter((goal) => goal.intern === selected.intern)
    : []
  const reviewSections = selected
    ? [
        {
          name: "Goals & outcomes",
          rating: selected.rating || "—",
          weight: "40%",
          comment:
            selected.overallFeedback || "No evaluator comment provided.",
          evidence:
            selectedGoals.map((goal) => goal.title).join(", ") ||
            "No goal evidence submitted.",
        },
        {
          name: "Technical / role performance",
          rating: selected.rating || "—",
          weight: "25%",
          comment:
            selected.strengths || "No evaluator comment provided.",
          evidence: "Mentor evaluation and submitted work evidence.",
        },
        {
          name: "Collaboration",
          rating: selected.rating || "—",
          weight: "20%",
          comment:
            selected.areasForImprovement ||
            "No evaluator comment provided.",
          evidence: "Collaboration observations from the active cycle.",
        },
        {
          name: "Learning & development",
          rating: selected.rating || "—",
          weight: "15%",
          comment:
            selected.developmentRecommendations ||
            "No evaluator comment provided.",
          evidence: "Development goals and learning activity.",
        },
      ]
    : []

  return (
    <>
      <PageIntro
        eyebrow="Performance reviews"
        title="Performance reviews"
        copy="Review employee evaluations, evidence, feedback, and performance outcomes."
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search reviews"
              className="w-full pl-9"
            />
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Icon name="settings" className="size-4" /> Filter
              {activeReviewFilters.length > 0 && (
                <Badge tone="purple">{activeReviewFilters.length}</Badge>
              )}
            </Button>
            {filterOpen && (
              <Card className="absolute right-0 top-12 z-30 w-80 p-4 shadow-xl">
                <div className="mb-3 text-sm font-semibold">
                  Filter performance reviews
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="field-label">Evaluation cycle</span>
                    <Select
                      value={cycleFilter}
                      onChange={setCycleFilter}
                      ariaLabel="Evaluation cycle"
                    >
                      <option>All</option>
                      {cycles.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Cohort</span>
                    <Select
                      value={cohortFilter}
                      onChange={setCohortFilter}
                      ariaLabel="Cohort"
                    >
                      <option>All</option>
                      <option>2025</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Mentor</span>
                    <Select
                      value={mentorFilter}
                      onChange={setMentorFilter}
                      ariaLabel="Mentor"
                    >
                      <option>All</option>
                      {[...new Set(evaluations.map((item) => item.mentor))].map(
                        (mentor) => (
                          <option key={mentor}>{mentor}</option>
                        ),
                      )}
                    </Select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      <span className="field-label">Section</span>
                      <Select
                        value={sectionFilter}
                        onChange={(value) => {
                          setSectionFilter(value)
                          setSubsectionFilter("All")
                        }}
                        ariaLabel="Section"
                      >
                        <option>All</option>
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>
                      </Select>
                    </label>
                    <label>
                      <span className="field-label">Sub-section</span>
                      <Select
                        value={subsectionFilter}
                        onChange={setSubsectionFilter}
                        ariaLabel="Sub-section"
                      >
                        <option>All</option>
                        {sectionFilter === "All" ? (
                          ["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"].map(
                            (value) => <option key={value}>{value}</option>,
                          )
                        ) : (
                          <>
                            <option>{sectionFilter}1</option>
                            <option>{sectionFilter}2</option>
                          </>
                        )}
                      </Select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="field-label">Review status</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      ariaLabel="Review status"
                    >
                      <option>All</option>
                      {[
                        "Draft",
                        "Submitted to HR",
                        "Pending HR Review",
                        "Changes Requested",
                        "Ready to Publish",
                        "Published",
                      ].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Performance outcome</span>
                    <Select
                      value={classificationFilter}
                      onChange={setClassificationFilter}
                      ariaLabel="Performance outcome"
                    >
                      <option>All</option>
                      <option>Achieved</option>
                      <option>Progressing</option>
                      <option>Focus Required</option>
                    </Select>
                  </label>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCycleFilter("All")
                      setCohortFilter("All")
                      setMentorFilter("All")
                      setSectionFilter("All")
                      setSubsectionFilter("All")
                      setStatusFilter("All")
                      setClassificationFilter("All")
                    }}
                  >
                    Clear all
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>
                    Apply filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {activeReviewFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border py-3">
            {activeReviewFilters.map((filter) => (
              <div key={filter.key} className="skill-pill">
                <span>
                  {filter.label}:{" "}
                  {filter.key === "cycle"
                    ? cycleName(filter.value)
                    : filter.value}
                </span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={filter.clear}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-3 text-xs text-muted">
          <span>
            {visibleReviews.length === evaluations.length
              ? `${visibleReviews.length} reviews`
              : `${visibleReviews.length} of ${evaluations.length} reviews`}
          </span>
          {activeReviewFilters.length > 0 && (
            <span>{activeReviewFilters.length} filters applied</span>
          )}
        </div>

        <div className="hr-review-grid hr-review-head">
          <span>Employee</span>
          <span>Mentor / cycle</span>
          <span>Rating</span>
          <span>Goals</span>
          <span>Classification</span>
          <span>Status</span>
          <span />
        </div>
        {visibleReviews.map((evaluation) => {
          const reviewStatus = displayStatus(evaluation.status)
          const reviewClassification = classification(evaluation)
          return (
            <div key={evaluation.id} className="hr-review-grid hr-review-row">
              <div className="flex items-center gap-3">
                <Avatar initials={evaluation.initials} small />
                <div>
                  <div className="text-sm font-semibold">
                    {evaluation.intern}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {evaluation.section} · Cohort 2025
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium">{evaluation.mentor}</div>
                <div className="mt-1 text-xs text-muted">
                  {cycleName(evaluation.cycleId)}
                </div>
              </div>
              <strong className="text-sm">
                {evaluation.rating ? `${evaluation.rating} / 5` : "—"}
              </strong>
              <div className="min-w-24">
                <div className="mb-1 text-xs font-medium">
                  {goalProgress(evaluation.intern)}%
                </div>
                <Progress value={goalProgress(evaluation.intern)} />
              </div>
              <Badge tone={classTone(reviewClassification)}>
                {reviewClassification}
              </Badge>
              <Badge tone={statusTone(reviewStatus)}>{reviewStatus}</Badge>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="icon-button"
                  onClick={() =>
                    setMenuId(menuId === evaluation.id ? null : evaluation.id)
                  }
                >
                  <Icon name="more" className="size-4" />
                </Button>
                {menuId === evaluation.id && (
                  <Card className="absolute right-0 top-10 z-20 w-48 p-2 shadow-xl">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openReview(evaluation.id)}
                    >
                      Open review
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openReview(evaluation.id, true)}
                    >
                      View evidence
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openReview(evaluation.id)}
                    >
                      Add feedback
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        updateStatus(evaluation.id, "Changes Requested")
                        setMenuId(null)
                      }}
                    >
                      Request changes
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      disabled={evaluation.status !== "Approved"}
                      onClick={() => {
                        updateStatus(evaluation.id, "Published")
                        setMenuId(null)
                      }}
                    >
                      Publish result
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          )
        })}
        {visibleReviews.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            No reviews match the selected filters.
          </div>
        )}
      </Card>

      {selected && (
        <Modal onClose={() => setSelectedId(null)}>
          <div className="modal-scroll">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone={statusTone(displayStatus(selected.status))}>
                  {displayStatus(selected.status)}
                </Badge>
                <div className="mt-3 text-xl font-semibold">
                  {selected.intern}
                </div>
                <div className="mt-1 text-sm text-muted">
                  EMP-{selected.id.replace(/\D/g, "").padStart(4, "0")} ·
                  Cohort 2025
                </div>
              </div>
              <Button
                variant="ghost"
                className="icon-button"
                onClick={() => setSelectedId(null)}
              >
                <Icon name="close" className="size-4" />
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <TaskDetail label="Section / sub-section" value={selected.section} />
              <TaskDetail label="Mentor" value={selected.mentor} />
              <TaskDetail
                label="Evaluation cycle"
                value={cycleName(selected.cycleId)}
              />
              <TaskDetail
                label="Overall rating"
                value={selected.rating ? `${selected.rating} / 5` : "Not entered"}
              />
              <TaskDetail
                label="Goal completion"
                value={`${goalProgress(selected.intern)}%`}
              />
              <TaskDetail
                label="Classification"
                value={classification(selected)}
              />
            </div>

            <div className="mt-6 text-sm font-semibold">
              {evidenceOnly ? "Evidence submitted" : "Evaluation sections"}
            </div>
            <div className="mt-2 divide-y divide-border rounded-xl border border-border px-4">
              {reviewSections.map((section) => (
                <div key={section.name} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{section.name}</div>
                    <div className="flex gap-2">
                      <Badge tone="neutral">Weight {section.weight}</Badge>
                      <Badge tone="purple">Rating {section.rating}</Badge>
                    </div>
                  </div>
                  {!evidenceOnly && (
                    <div className="mt-2 text-xs leading-5 text-muted">
                      {section.comment}
                    </div>
                  )}
                  <div className="mt-2 rounded-lg bg-neutral-50 p-3 text-xs text-muted">
                    <strong className="text-ink">Evidence:</strong>{" "}
                    {section.evidence}
                  </div>
                </div>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="field-label">HR feedback / comments</span>
              <TextInput
                value={hrFeedback[selected.id] ?? ""}
                onChange={(value) =>
                  setHrFeedback((current) => ({
                    ...current,
                    [selected.id]: value,
                  }))
                }
                placeholder="Add HR feedback for this review"
              />
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={saveFeedback}>
                Save feedback
              </Button>
              <Button
                variant="secondary"
                onClick={() => updateStatus(selected.id, "Changes Requested")}
              >
                Request changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => updateStatus(selected.id, "Approved")}
              >
                Approve review
              </Button>
              <Button
                disabled={selected.status !== "Approved"}
                onClick={() => updateStatus(selected.id, "Published")}
              >
                Publish result
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function HRReviewManagementPage({
  cycles,
  evaluations,
  createCycle,
  updateCycle,
}: {
  cycles: ReviewCycle[]
  evaluations: MentorEvaluation[]
  createCycle: (cycle: ReviewCycle) => void
  updateCycle: (cycleId: string, updates: Partial<ReviewCycle>) => void
}) {
  const [selectedCycleId, setSelectedCycleId] = useState(
    cycles.find((cycle) => cycle.status === "Open")?.id ?? cycles[0]?.id ?? "",
  )
  const [tab, setTab] = useState("Evaluation form")
  const [cycleModalOpen, setCycleModalOpen] = useState(false)
  const [editingCycleId, setEditingCycleId] = useState<string | null>(null)
  const [cycleName, setCycleName] = useState("")
  const [cycleStart, setCycleStart] = useState("")
  const [cycleEnd, setCycleEnd] = useState("")
  const [population, setPopulation] = useState("All interns")
  const [editingSectionId, setEditingSectionId] = useState<string | null>(
    null,
  )
  const [sectionNameDraft, setSectionNameDraft] = useState("")
  const [performanceSections, setPerformanceSections] = useState([
    {
      id: "goals",
      name: "Goals & Outcomes",
      weight: 40,
      questions: [
        "To what extent were assigned goals achieved?",
        "What measurable outcomes were delivered?",
      ],
    },
    {
      id: "technical",
      name: "Technical Performance",
      weight: 25,
      questions: [
        "How effectively were role-specific skills demonstrated?",
      ],
    },
    {
      id: "collaboration",
      name: "Communication & Collaboration",
      weight: 20,
      questions: [
        "How effectively did the intern communicate and collaborate?",
      ],
    },
    {
      id: "learning",
      name: "Learning & Development",
      weight: 15,
      questions: [
        "How consistently did the intern apply feedback and learning?",
      ],
    },
  ])
  const [ratingScale, setRatingScale] = useState([
    { score: 1, label: "Needs significant improvement" },
    { score: 2, label: "Developing" },
    { score: 3, label: "Meets expectations" },
    { score: 4, label: "Exceeds expectations" },
    { score: 5, label: "Outstanding" },
  ])
  const [editingRating, setEditingRating] = useState<number | null>(null)
  const [assignments, setAssignments] = useState([
    { mentor: "Daniel Ortiz", intern: "Maya Chen" },
    { mentor: "Daniel Ortiz", intern: "Alex Morgan" },
    { mentor: "Priya Rao", intern: "Noah Williams" },
  ])
  const [assignmentMentor, setAssignmentMentor] = useState("Daniel Ortiz")
  const [assignmentIntern, setAssignmentIntern] = useState("Priya Rao")
  const [visibility, setVisibility] = useState({
    comments: false,
    ratings: false,
    results: false,
    approvalRequired: true,
    submissionRequired: true,
  })
  const selectedCycle =
    cycles.find((cycle) => cycle.id === selectedCycleId) ?? cycles[0] ?? null
  const cycleEvaluations = evaluations.filter(
    (evaluation) => evaluation.cycleId === selectedCycleId,
  )
  const inProgress = cycleEvaluations.filter((evaluation) =>
    ["Draft", "In progress", "Ready to submit"].includes(evaluation.status),
  ).length
  const awaiting = cycleEvaluations.filter((evaluation) =>
    ["Submitted to HR", "Pending HR Review"].includes(evaluation.status),
  ).length
  const ready = cycleEvaluations.filter(
    (evaluation) => evaluation.status === "Approved",
  ).length
  const openCycleModal = (cycle?: ReviewCycle) => {
    setEditingCycleId(cycle?.id ?? null)
    setCycleName(cycle?.name ?? "")
    setCycleStart(cycle?.startDate ?? "")
    setCycleEnd(cycle?.endDate ?? "")
    setPopulation(cycle?.eligiblePopulation ?? "All interns")
    setCycleModalOpen(true)
  }
  const saveCycle = () => {
    if (!cycleName.trim() || !cycleStart || !cycleEnd) return
    if (editingCycleId) {
      updateCycle(editingCycleId, {
        name: cycleName.trim(),
        startDate: cycleStart,
        endDate: cycleEnd,
        eligiblePopulation: population,
      })
    } else {
      createCycle({
        id: `cycle-${Date.now()}`,
        name: cycleName.trim(),
        startDate: cycleStart,
        endDate: cycleEnd,
        eligiblePopulation: population,
        applicableEmployees: [],
        status: "Draft",
        publicationStatus: "draft",
      })
    }
    setCycleModalOpen(false)
  }
  const moveSection = (index: number) => {
    if (index === 0) return
    setPerformanceSections((current) => {
      const next = [...current]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }
  const updateSectionWeight = (sectionId: string, nextWeight: number) => {
    setPerformanceSections((current) => {
      const section = current.find((item) => item.id === sectionId)
      const balancingSection = current.find((item) => item.id !== sectionId)
      if (!section || !balancingSection) return current
      const difference = nextWeight - section.weight
      if (balancingSection.weight - difference < 5) return current
      return current.map((item) =>
        item.id === sectionId
          ? { ...item, weight: nextWeight }
          : item.id === balancingSection.id
            ? { ...item, weight: item.weight - difference }
            : item,
      )
    })
  }
  const addPerformanceSection = () => {
    setPerformanceSections((current) => {
      const largest = [...current].sort((a, b) => b.weight - a.weight)[0]
      if (!largest || largest.weight < 15) return current
      return [
        ...current.map((item) =>
          item.id === largest.id
            ? { ...item, weight: item.weight - 10 }
            : item,
        ),
        {
          id: `section-${Date.now()}`,
          name: "New performance section",
          weight: 10,
          questions: ["New evaluation parameter"],
        },
      ]
    })
  }
  const deletePerformanceSection = (sectionId: string) => {
    setPerformanceSections((current) => {
      const removed = current.find((item) => item.id === sectionId)
      const remaining = current.filter((item) => item.id !== sectionId)
      if (!removed || remaining.length === 0) return current
      return remaining.map((item, index) =>
        index === 0
          ? { ...item, weight: item.weight + removed.weight }
          : item,
      )
    })
  }

  return (
    <>
      <PageIntro
        eyebrow="Review governance"
        title="Review management"
        copy="Configure evaluation cycles, scoring, evaluator assignments, and result visibility."
        action={
          <Button onClick={() => openCycleModal()}>
            <Icon name="plus" className="size-4" /> Create evaluation cycle
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Active evaluation cycle</div>
          <div className="mt-2 text-sm font-semibold">
            {cycles.find((cycle) => cycle.status === "Open")?.name ?? "None"}
          </div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Reviews in progress</div>
          <div className="mt-2 text-xl font-semibold">{inProgress}</div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Awaiting HR review</div>
          <div className="mt-2 text-xl font-semibold">{awaiting}</div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Ready to publish</div>
          <div className="mt-2 text-xl font-semibold">{ready}</div>
        </Card>
      </div>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle
          title="Evaluation cycles"
          action={
            <Select
              value={selectedCycleId}
              onChange={setSelectedCycleId}
              ariaLabel="Selected evaluation cycle"
            >
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </Select>
          }
        />
        <div className="divide-y divide-border">
          {cycles.map((cycle) => {
            const participants = evaluations.filter(
              (evaluation) => evaluation.cycleId === cycle.id,
            )
            const complete = participants.filter(
              (evaluation) => evaluation.status === "Published",
            ).length
            const progress = participants.length
              ? Math.round((complete / participants.length) * 100)
              : 0
            return (
              <div
                key={cycle.id}
                className="grid gap-3 py-3 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div>
                  <div className="text-sm font-semibold">{cycle.name}</div>
                  <div className="mt-1 text-xs text-muted">
                    {cycle.startDate} – {cycle.endDate} ·{" "}
                    {cycle.eligiblePopulation} · {participants.length} participants
                  </div>
                  <div className="mt-2 max-w-sm">
                    <Progress value={progress} />
                  </div>
                </div>
                <Badge
                  tone={
                    cycle.status === "Open"
                      ? "green"
                      : cycle.status === "Draft"
                        ? "neutral"
                        : "amber"
                  }
                >
                  {cycle.status}
                </Badge>
                <div className="flex gap-2">
                  {cycle.status === "Draft" && (
                    <Button
                      variant="secondary"
                      onClick={() => openCycleModal(cycle)}
                    >
                      Edit cycle
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      updateCycle(cycle.id, {
                        status: cycle.status === "Open" ? "Closed" : "Open",
                      })
                    }
                  >
                    {cycle.status === "Open" ? "Close cycle" : "Open cycle"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <div className="flex gap-2 overflow-x-auto border-b border-border pb-3">
          {[
            "Evaluation form",
            "Rating scale",
            "Evaluator assignment",
            "Visibility & publishing",
            "Review workflow",
          ].map((item) => (
            <Button
              key={item}
              variant={tab === item ? "primary" : "ghost"}
              onClick={() => setTab(item)}
              className="shrink-0"
            >
              {item}
            </Button>
          ))}
        </div>

        {tab === "Evaluation form" && (
          <div className="pt-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-base font-semibold">Evaluation form</div>
                <div className="mt-1 text-xs text-muted">
                  {selectedCycle?.name ?? "Select a cycle"} · Total weight{" "}
                  {performanceSections.reduce(
                    (sum, section) => sum + section.weight,
                    0,
                  )}
                  %
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={addPerformanceSection}
              >
                <Icon name="plus" className="size-4" /> Add performance section
              </Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {performanceSections.map((section, index) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="border-b border-border pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                      {editingSectionId === section.id ? (
                        <TextInput
                          value={sectionNameDraft}
                          onChange={setSectionNameDraft}
                          className="min-w-52"
                        />
                      ) : (
                        <div className="whitespace-nowrap text-sm font-semibold">
                          {section.name}
                        </div>
                      )}
                      </div>
                      <div className="w-20">
                        <Select
                          value={String(section.weight)}
                          onChange={(value) =>
                            updateSectionWeight(section.id, Number(value))
                          }
                          ariaLabel={`Weight for ${section.name}`}
                        >
                          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(
                            (weight) => (
                              <option key={weight} value={weight}>
                                {weight}%
                              </option>
                            ),
                          )}
                        </Select>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (editingSectionId === section.id) {
                            setPerformanceSections((current) =>
                              current.map((item) =>
                                item.id === section.id
                                  ? {
                                      ...item,
                                      name:
                                        sectionNameDraft.trim() || item.name,
                                    }
                                  : item,
                              ),
                            )
                            setEditingSectionId(null)
                          } else {
                            setEditingSectionId(section.id)
                            setSectionNameDraft(section.name)
                          }
                        }}
                      >
                        {editingSectionId === section.id ? "Save" : "Edit"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => moveSection(index)}
                      >
                        Reorder
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => deletePerformanceSection(section.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {section.questions.map((question, questionIndex) => (
                      <div
                        key={`${section.id}-${questionIndex}`}
                        className="flex items-start gap-2 rounded-lg bg-neutral-50 p-2.5"
                      >
                        <span className="flex-1 text-xs leading-5 text-muted">
                          {question}
                        </span>
                        <Button
                          variant="ghost"
                          className="icon-button"
                          onClick={() =>
                            setPerformanceSections((current) =>
                              current.map((item) =>
                                item.id === section.id
                                  ? {
                                      ...item,
                                      questions: item.questions.filter(
                                        (_, itemIndex) =>
                                          itemIndex !== questionIndex,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Icon name="close" className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setPerformanceSections((current) =>
                          current.map((item) =>
                            item.id === section.id
                              ? {
                                  ...item,
                                  questions: [
                                    ...item.questions,
                                    "New evaluation parameter",
                                  ],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      Add parameter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Rating scale" && (
          <div className="pt-4">
            <SectionTitle
              title="5-point rating scale"
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    setRatingScale((current) => [
                      ...current,
                      {
                        score:
                          Math.max(0, ...current.map((item) => item.score)) + 1,
                        label: "New rating level",
                      },
                    ])
                  }
                >
                  <Icon name="plus" className="size-4" /> Add rating level
                </Button>
              }
            />
            <div className="mb-3 rounded-xl bg-purple-50 p-3 text-xs leading-5 text-purple-950">
              Section weights determine how each evaluation area contributes to
              the overall score. Rating levels determine the score within each
              section.
            </div>
            <div className="space-y-2">
              {ratingScale.map((rating, index) => (
                <div
                  key={rating.score}
                  className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="grid size-8 place-items-center rounded-lg bg-purple-100 text-sm font-semibold text-purple-700">
                    {rating.score}
                  </div>
                  {editingRating === rating.score ? (
                    <TextInput
                      value={rating.label}
                      onChange={(value) =>
                        setRatingScale((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: value }
                              : item,
                          ),
                        )
                      }
                    />
                  ) : (
                    <div className="text-sm font-medium">{rating.label}</div>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setEditingRating(
                        editingRating === rating.score ? null : rating.score,
                      )
                    }
                  >
                    {editingRating === rating.score ? "Save" : "Edit"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Evaluator assignment" && (
          <div className="pt-4">
            <SectionTitle title="Evaluator assignment" />
            <div className="divide-y divide-border">
              {assignments.map((assignment, index) => (
                <div
                  key={`${assignment.mentor}-${assignment.intern}-${index}`}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center"
                >
                  <Select
                    value={assignment.mentor}
                    onChange={(value) =>
                      setAssignments((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, mentor: value }
                            : item,
                        ),
                      )
                    }
                    ariaLabel="Assigned evaluator"
                  >
                    <option>Daniel Ortiz</option>
                    <option>Priya Rao</option>
                  </Select>
                  <Icon name="arrow" className="size-4 text-muted" />
                  <div className="text-sm font-medium">{assignment.intern}</div>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setAssignments((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Select
                value={assignmentMentor}
                onChange={setAssignmentMentor}
                ariaLabel="New evaluator"
              >
                <option>Daniel Ortiz</option>
                <option>Priya Rao</option>
              </Select>
              <Select
                value={assignmentIntern}
                onChange={setAssignmentIntern}
                ariaLabel="Intern to evaluate"
              >
                <option>Alex Morgan</option>
                <option>Maya Chen</option>
                <option>Noah Williams</option>
                <option>Priya Rao</option>
              </Select>
              <Button
                onClick={() =>
                  setAssignments((current) => [
                    ...current,
                    {
                      mentor: assignmentMentor,
                      intern: assignmentIntern,
                    },
                  ])
                }
              >
                Assign evaluator
              </Button>
            </div>
          </div>
        )}

        {tab === "Visibility & publishing" && (
          <div className="pt-4">
            <SectionTitle title="Visibility & publishing" />
            <div className="space-y-2">
              {[
                ["comments", "Comments visible to employee"],
                ["ratings", "Ratings visible to employee"],
                ["results", "Results visible to employee"],
                ["approvalRequired", "HR approval required before publishing"],
                [
                  "submissionRequired",
                  "Mentor submission required before HR review",
                ],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3"
                >
                  <Checkbox
                    checked={visibility[key as keyof typeof visibility]}
                    onChange={() =>
                      setVisibility((current) => ({
                        ...current,
                        [key]: !current[key as keyof typeof current],
                      }))
                    }
                    label={label}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-amber-100 p-4 text-sm leading-6 text-amber-700">
              Employee and intern results remain hidden until HR publishes the
              approved evaluation.
            </div>
          </div>
        )}

        {tab === "Review workflow" && (
          <div className="pt-4">
            <SectionTitle title="Review workflow" />
            <div className="grid gap-2 md:grid-cols-7 md:items-center">
              {[
                "Mentor evaluates",
                "Submit to HR",
                "HR reviews",
                "Changes requested if needed",
                "HR approves",
                "HR publishes",
                "Employee can view result",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-2 md:flex-col">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                    {index + 1}
                  </div>
                  <div className="text-center text-xs font-medium">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {cycleModalOpen && (
        <Modal onClose={() => setCycleModalOpen(false)}>
          <SectionTitle
            title={editingCycleId ? "Edit evaluation cycle" : "Create evaluation cycle"}
            eyebrow="Review governance"
          />
          <div className="space-y-4">
            <label className="block">
              <span className="field-label">Cycle name</span>
              <TextInput
                value={cycleName}
                onChange={setCycleName}
                placeholder="e.g. Quarterly Performance Review"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="field-label">Start date</span>
                <TextInput
                  type="date"
                  value={cycleStart}
                  onChange={setCycleStart}
                />
              </label>
              <label>
                <span className="field-label">End date</span>
                <TextInput
                  type="date"
                  value={cycleEnd}
                  onChange={setCycleEnd}
                />
              </label>
            </div>
            <label className="block">
              <span className="field-label">Eligible population</span>
              <Select
                value={population}
                onChange={setPopulation}
                ariaLabel="Eligible population"
              >
                <option>All interns</option>
                <option>Section A</option>
                <option>Section B</option>
                <option>Section C</option>
                <option>Section D</option>
                <option>Selected subsections</option>
              </Select>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setCycleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!cycleName.trim() || !cycleStart || !cycleEnd}
              onClick={saveCycle}
            >
              {editingCycleId ? "Save cycle" : "Create cycle"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function HRPerformanceOverviewPage() {
  type AnalyticsRecord = {
    cycle: string
    cohort: string
    section: string
    subsection: string
    mentor: string
    outcome:
      | "Exceeds expectations"
      | "Meets expectations"
      | "Developing"
      | "Needs support"
    employeeStatus: string
    reviewed: number
    eligible: number
    score: number
    goalsAchieved: number
  }
  const [search, setSearch] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    cycle: "All",
    cohort: "All",
    section: "All",
    subsection: "All",
    mentor: "All",
    outcome: "All",
    employeeStatus: "All",
  })
  const outcomes: AnalyticsRecord["outcome"][] = [
    "Exceeds expectations",
    "Meets expectations",
    "Developing",
    "Needs support",
  ]
  const sectionData = [
    {
      section: "A",
      subsection: "A1",
      cycle: "Mid-Year Performance Review",
      cohort: "Graduate 2025",
      mentor: "Daniel Ortiz",
      employeeStatus: "Active",
      reviewed: [14, 26, 5, 2],
      eligible: [15, 28, 5, 2],
      score: 4.3,
      goals: 88,
    },
    {
      section: "B",
      subsection: "B2",
      cycle: "Mid-Year Performance Review",
      cohort: "Graduate 2025",
      mentor: "Daniel Ortiz",
      employeeStatus: "Active",
      reviewed: [13, 27, 5, 1],
      eligible: [14, 29, 5, 1],
      score: 4.1,
      goals: 83,
    },
    {
      section: "C",
      subsection: "C1",
      cycle: "Annual Performance Review",
      cohort: "Intern 2025",
      mentor: "Priya Rao",
      employeeStatus: "Active",
      reviewed: [11, 27, 6, 1],
      eligible: [12, 28, 7, 1],
      score: 4,
      goals: 81,
    },
    {
      section: "D",
      subsection: "D2",
      cycle: "Annual Performance Review",
      cohort: "Intern 2025",
      mentor: "Priya Rao",
      employeeStatus: "Active",
      reviewed: [14, 26, 6, 2],
      eligible: [15, 28, 6, 2],
      score: 4.2,
      goals: 84,
    },
  ]
  const records: AnalyticsRecord[] = sectionData.flatMap((section) =>
    outcomes.map((outcome, index) => ({
      cycle: section.cycle,
      cohort: section.cohort,
      section: section.section,
      subsection: section.subsection,
      mentor: section.mentor,
      outcome,
      employeeStatus: section.employeeStatus,
      reviewed: section.reviewed[index],
      eligible: section.eligible[index],
      score: section.score,
      goalsAchieved: section.goals,
    })),
  )
  const filteredRecords = records.filter((record) => {
    const matchesSearch = `${record.section} ${record.subsection} ${record.mentor} ${record.cohort} ${record.outcome}`
      .toLowerCase()
      .includes(search.toLowerCase())
    return (
      matchesSearch &&
      (filters.cycle === "All" || record.cycle === filters.cycle) &&
      (filters.cohort === "All" || record.cohort === filters.cohort) &&
      (filters.section === "All" || record.section === filters.section) &&
      (filters.subsection === "All" ||
        record.subsection === filters.subsection) &&
      (filters.mentor === "All" || record.mentor === filters.mentor) &&
      (filters.outcome === "All" || record.outcome === filters.outcome) &&
      (filters.employeeStatus === "All" ||
        record.employeeStatus === filters.employeeStatus)
    )
  })
  const reviewed = filteredRecords.reduce(
    (sum, record) => sum + record.reviewed,
    0,
  )
  const eligible = filteredRecords.reduce(
    (sum, record) => sum + record.eligible,
    0,
  )
  const uniqueSections = [
    ...new Map(
      filteredRecords.map((record) => [record.section, record]),
    ).values(),
  ]
  const averageScore = uniqueSections.length
    ? uniqueSections.reduce((sum, record) => sum + record.score, 0) /
      uniqueSections.length
    : 0
  const displayedAverageScore =
    Math.round((averageScore + Number.EPSILON) * 10) / 10
  const goalsAchieved = uniqueSections.length
    ? Math.round(
        uniqueSections.reduce(
          (sum, record) => sum + record.goalsAchieved,
          0,
        ) / uniqueSections.length,
      )
    : 0
  const participation = eligible
    ? Math.round((reviewed / eligible) * 100)
    : 0
  const outcomeData = outcomes.map((outcome) => {
    const count = filteredRecords
      .filter((record) => record.outcome === outcome)
      .reduce((sum, record) => sum + record.reviewed, 0)
    return {
      label: outcome,
      count,
      percentage: reviewed ? Math.round((count / reviewed) * 100) : 0,
      color:
        outcome === "Exceeds expectations"
          ? "bg-purple-600"
          : outcome === "Meets expectations"
            ? "bg-blue-500"
            : outcome === "Developing"
              ? "bg-amber-500"
              : "bg-red-500",
    }
  })
  const donutStops = outcomeData.map((item) => item.percentage)
  const donutStyle = {
    "--donut-first": `${donutStops[0]}%`,
    "--donut-second": `${donutStops[0] + donutStops[1]}%`,
    "--donut-third": `${donutStops[0] + donutStops[1] + donutStops[2]}%`,
  } as CSSProperties
  const scoreDifference = averageScore - 4.15
  const trend = [
    { label: "Q1", value: Math.max(0, 3.8 + scoreDifference) },
    { label: "Q2", value: Math.max(0, 4 + scoreDifference) },
    { label: "Q3", value: Math.max(0, 4.1 + scoreDifference) },
    { label: "Q4", value: Math.max(0, 4.2 + scoreDifference) },
  ]
  const trendPoints = trend
    .map(
      (item, index) =>
        `${20 + index * 120},${150 - Math.max(0, Math.min(5, item.value)) * 25}`,
    )
    .join(" ")
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== "All",
  )
  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "section" && value === "All"
        ? { subsection: "All" }
        : {}),
    }))
  const filterOptions: {
    key: keyof typeof filters
    label: string
    values: string[]
  }[] = [
    {
      key: "cycle",
      label: "Evaluation cycle",
      values: [...new Set(records.map((record) => record.cycle))],
    },
    {
      key: "cohort",
      label: "Cohort",
      values: [...new Set(records.map((record) => record.cohort))],
    },
    {
      key: "section",
      label: "Section",
      values: ["A", "B", "C", "D"],
    },
    {
      key: "subsection",
      label: "Sub-section",
      values:
        filters.section === "All"
          ? [...new Set(records.map((record) => record.subsection))]
          : [
              `${filters.section}1`,
              `${filters.section}2`,
            ],
    },
    {
      key: "mentor",
      label: "Mentor",
      values: [...new Set(records.map((record) => record.mentor))],
    },
    { key: "outcome", label: "Performance outcome", values: outcomes },
    {
      key: "employeeStatus",
      label: "Employee status",
      values: ["Active", "On leave", "Completed"],
    },
  ]

  return (
    <>
      <PageIntro
        eyebrow="HR"
        title="Performance overview"
        copy="Monitor performance trends, outcomes, and participation across the organization."
      />
      <Card className="dashboard-compact-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search performance overview"
              className="w-full pl-9"
            />
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Icon name="settings" className="size-4" /> Filter
              {activeFilters.length > 0 && (
                <Badge tone="purple">{activeFilters.length}</Badge>
              )}
            </Button>
            {filterOpen && (
              <Card className="absolute right-0 top-12 z-20 w-80 p-4 shadow-xl">
                <div className="mb-3 text-sm font-semibold">
                  Filter performance data
                </div>
                <div className="space-y-3">
                  {filterOptions.map((option) => (
                    <label key={option.key} className="block">
                      <span className="field-label">{option.label}</span>
                      <Select
                        value={filters[option.key]}
                        onChange={(value) => setFilter(option.key, value)}
                        ariaLabel={option.label}
                      >
                        <option>All</option>
                        {option.values.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </Select>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setFilters({
                        cycle: "All",
                        cohort: "All",
                        section: "All",
                        subsection: "All",
                        mentor: "All",
                        outcome: "All",
                        employeeStatus: "All",
                      })
                    }
                  >
                    Clear all
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>
                    Apply filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <div key={key} className="skill-pill">
                <span>
                  {filterOptions.find((option) => option.key === key)?.label}:{" "}
                  {value}
                </span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() =>
                    setFilter(key as keyof typeof filters, "All")
                  }
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Average score</div>
          <div className="mt-2 text-xl font-semibold">
            {averageScore ? `${displayedAverageScore.toFixed(1)} / 5` : "—"}
          </div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Employees reviewed</div>
          <div className="mt-2 text-xl font-semibold">{reviewed}</div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Goals achieved</div>
          <div className="mt-2 text-xl font-semibold">{goalsAchieved}%</div>
        </Card>
        <Card className="dashboard-compact-card">
          <div className="text-xs text-muted">Cycle participation</div>
          <div className="mt-2 text-xl font-semibold">{participation}%</div>
        </Card>
      </div>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle title="Performance outcomes" />
        <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr] lg:items-center">
          <div className="flex justify-center">
            <div
              className={`donut ${reviewed === 0 ? "donut-empty" : ""}`}
              style={donutStyle}
            >
              <div className="donut-center">
                <strong>{reviewed}</strong>
                <span>Reviews</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {outcomeData.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center text-sm">
                  <span
                    className={`mr-3 size-2.5 rounded-full ${item.color}`}
                  />
                  <span className="flex-1 text-muted">{item.label}</span>
                  <strong>{item.percentage}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <SectionTitle title="Performance trend" />
        <div className="analytics-chart">
          <svg
            viewBox="0 0 400 170"
            className="h-48 w-full"
            aria-label="Average performance score by review period"
          >
            {[25, 75, 125].map((y) => (
              <line
                key={y}
                x1="20"
                x2="380"
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-neutral-200"
                strokeWidth="1"
              />
            ))}
            <polyline
              points={trendPoints}
              fill="none"
              stroke="currentColor"
              className="text-purple-600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {trend.map((item, index) => {
              const x = 20 + index * 120
              const y = 150 - Math.max(0, Math.min(5, item.value)) * 25
              return (
                <g key={item.label}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="currentColor"
                    className="text-purple-600"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="fill-ink text-xs font-semibold"
                  >
                    {item.value.toFixed(1)}
                  </text>
                  <text
                    x={x}
                    y="166"
                    textAnchor="middle"
                    className="fill-muted text-xs"
                  >
                    {item.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Card className="dashboard-compact-card">
          <SectionTitle title="Performance by section" />
          <div className="divide-y divide-border">
            {uniqueSections.map((section) => (
              <div
                key={section.section}
                className="grid gap-3 py-3 sm:grid-cols-[8rem_1fr_5rem] sm:items-center"
              >
                <div className="text-sm font-semibold">
                  Section {section.section}
                </div>
                <Progress value={(section.score / 5) * 100} />
                <div className="text-right text-sm font-semibold">
                  {section.score.toFixed(1)} / 5
                </div>
              </div>
            ))}
            {uniqueSections.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">
                No section data matches the current filters.
              </div>
            )}
          </div>
        </Card>
        <Card className="dashboard-compact-card">
          <SectionTitle title="At a glance" />
          <div className="text-3xl font-semibold">{participation}%</div>
          <div className="mt-1 text-sm text-muted">Cycle participation</div>
          <div className="mt-4 text-sm font-medium">
            {reviewed} / {eligible} employees reviewed
          </div>
          <div className="mt-3">
            <Progress value={participation} />
          </div>
        </Card>
      </div>
    </>
  )
}

function AuditLogsPage({
  events,
  evaluations,
  goals,
  cycle,
  unlockReview,
}: {
  events: AuditEvent[]
  evaluations: MentorEvaluation[]
  goals: MentorGoal[]
  cycle: ReviewCycle | null
  unlockReview: (evaluationId: string, reason: string) => void
}) {
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("All")
  const [actorFilter, setActorFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("All dates")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [reviewFilter, setReviewFilter] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openEventMenu, setOpenEventMenu] = useState<string | null>(null)
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  const [unlockEvaluationId, setUnlockEvaluationId] = useState<string | null>(
    null,
  )
  const [unlockReason, setUnlockReason] = useState("")
  const [unlockConfirmed, setUnlockConfirmed] = useState(false)
  const activeFilters = [
    eventFilter !== "All" && {
      key: "event",
      label: `Event: ${eventFilter}`,
      clear: () => setEventFilter("All"),
    },
    actorFilter.trim() && {
      key: "actor",
      label: `User / actor: ${actorFilter.trim()}`,
      clear: () => setActorFilter(""),
    },
    dateFilter !== "All dates" && {
      key: "date",
      label: `Date: ${dateFilter}`,
      clear: () => setDateFilter("All dates"),
    },
    roleFilter !== "All roles" && {
      key: "role",
      label: `Role: ${roleFilter}`,
      clear: () => setRoleFilter("All roles"),
    },
    reviewFilter.trim() && {
      key: "review",
      label: `Review / employee: ${reviewFilter.trim()}`,
      clear: () => setReviewFilter(""),
    },
  ].filter(Boolean) as {
    key: string
    label: string
    clear: () => void
  }[]
  const visibleEvents = events
    .filter((item) =>
      `${item.event} ${item.person ?? ""} ${item.actor}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .filter((item) => eventFilter === "All" || item.event === eventFilter)
    .filter((item) =>
      `${item.person ?? ""} ${item.actor}`
        .toLowerCase()
        .includes(actorFilter.trim().toLowerCase()),
    )
    .filter(
      (item) => roleFilter === "All roles" || item.role === roleFilter,
    )
    .filter((item) =>
      reviewFilter.trim()
        ? Boolean(item.evaluationId) &&
          `${item.person ?? ""} ${item.event}`
            .toLowerCase()
            .includes(reviewFilter.trim().toLowerCase())
        : true,
    )
    .filter((item) => {
      if (dateFilter === "All dates" || dateFilter === "Last 7 days")
        return true
      if (dateFilter === "Last 24 hours")
        return (
          item.time.includes("m ago") ||
          item.time.includes("h ago") ||
          item.time === "Now"
        )
      return true
    })
  const selectedReview = evaluations.find(
    (evaluation) => evaluation.id === selectedReviewId,
  )
  const unlockEvaluation = evaluations.find(
    (evaluation) => evaluation.id === unlockEvaluationId,
  )
  const selectedGoals = selectedReview
    ? goals.filter((goal) => goal.intern === selectedReview.intern)
    : []
  const selectedHistory = selectedReview
    ? events.filter(
        (event) =>
          event.evaluationId === selectedReview.id ||
          (event.person === selectedReview.intern &&
            event.event.startsWith("Review")),
      )
    : []
  const openReview = (event: AuditEvent) => {
    const evaluation =
      evaluations.find((item) => item.id === event.evaluationId) ??
      evaluations[0]
    if (evaluation) setSelectedReviewId(evaluation.id)
    setOpenEventMenu(null)
  }
  const beginUnlock = (event: AuditEvent) => {
    const evaluation =
      evaluations.find((item) => item.id === event.evaluationId) ??
      evaluations[0]
    if (evaluation) {
      setUnlockEvaluationId(evaluation.id)
      setUnlockReason("")
    }
    setOpenEventMenu(null)
  }

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
          System Admin
        </div>
        <div className="text-3xl font-semibold tracking-tight text-ink">
          Audit logs
        </div>
        <div className="mt-1 text-sm text-muted">
          Trace identity, access, review, and administrative actions across
          Performax.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.38fr] lg:items-start">
        <Card className="dashboard-compact-card">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput
                value={search}
                onChange={setSearch}
                placeholder="Search audit logs"
                className="w-full pl-9"
              />
            </div>
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filter
                {activeFilters.length > 0 && (
                  <Badge tone="purple">{activeFilters.length}</Badge>
                )}
              </Button>
              {filtersOpen && (
                <Card className="absolute right-0 top-12 z-30 w-80 p-4 shadow-xl">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="field-label">Event type</span>
                      <Select
                        value={eventFilter}
                        onChange={setEventFilter}
                        ariaLabel="Filter audit logs by event type"
                      >
                        <option>All</option>
                        <option>Role changed</option>
                        <option>User created</option>
                        <option>Account deactivated</option>
                        <option>Review published</option>
                        <option>Review unlocked</option>
                        <option>Review accessed</option>
                        <option>Permission changed</option>
                        <option>Access/security event</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="field-label">User / actor</span>
                      <TextInput
                        value={actorFilter}
                        onChange={setActorFilter}
                        placeholder="Any user or actor"
                        className="w-full"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Date range</span>
                      <Select
                        value={dateFilter}
                        onChange={setDateFilter}
                        ariaLabel="Filter audit logs by date range"
                      >
                        <option>All dates</option>
                        <option>Last 24 hours</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="field-label">Role</span>
                      <Select
                        value={roleFilter}
                        onChange={setRoleFilter}
                        ariaLabel="Filter audit logs by role"
                      >
                        <option>All roles</option>
                        <option>System Admin</option>
                        <option>HR</option>
                        <option>Mentor</option>
                        <option>Employee</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="field-label">Review / employee</span>
                      <TextInput
                        value={reviewFilter}
                        onChange={setReviewFilter}
                        placeholder="Any review or employee"
                        className="w-full"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEventFilter("All")
                        setActorFilter("")
                        setDateFilter("All dates")
                        setRoleFilter("All roles")
                        setReviewFilter("")
                      }}
                    >
                      Clear all
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div key={filter.key} className="skill-pill">
                  <span>{filter.label}</span>
                  <Button
                    variant="ghost"
                    className="skill-action"
                    onClick={filter.clear}
                  >
                    <Icon name="close" className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            {visibleEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex min-h-16 items-center justify-between gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700">
                      <Icon name="audit" className="size-4" />
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {event.event}
                      {event.person && (
                        <span className="font-normal text-muted">
                          {" "}
                          · {event.person}
                        </span>
                      )}
                      <span className="font-normal text-muted">
                        {" "}
                        · {event.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      tone={
                        event.status === "Primary"
                          ? "purple"
                          : event.status === "Review"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {event.status}
                    </Badge>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className="icon-button"
                        onClick={() =>
                          setOpenEventMenu(
                            openEventMenu === event.id ? null : event.id,
                          )
                        }
                      >
                        <Icon name="more" />
                      </Button>
                      {openEventMenu === event.id && (
                        <Card className="absolute right-0 top-10 z-30 w-56 p-2 shadow-xl">
                          {event.evaluationId ||
                          event.event.startsWith("Review") ? (
                            <>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => openReview(event)}
                              >
                                View review
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => openReview(event)}
                              >
                                View complete history
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => beginUnlock(event)}
                              >
                                Unlock for re-review
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setOpenEventMenu(null)}
                              >
                                View details
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setOpenEventMenu(null)}
                              >
                                View related activity
                              </Button>
                            </>
                          )}
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No audit events match your search and filters.
              </div>
            )}
          </div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">Audit activity</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["248", "Total events"],
              ["18", "Access changes"],
              ["4", "Review actions"],
              ["2", "Security events"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-border p-3">
                <div className="text-xl font-semibold">{value}</div>
                <div className="mt-1 text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedReview && (
        <Modal
          onClose={() => setSelectedReviewId(null)}
          className="max-w-3xl"
        >
          <div className="modal-scroll">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="purple">View only</Badge>
                <div className="mt-3 text-xl font-semibold">
                  {selectedReview.intern} · Performance review
                </div>
                <div className="mt-1 text-sm text-muted">
                  Complete review and administrative history
                </div>
              </div>
              <Button
                variant="ghost"
                className="icon-button"
                onClick={() => setSelectedReviewId(null)}
              >
                <Icon name="close" className="size-4" />
              </Button>
            </div>

            <label className="mt-5 block">
              <span className="field-label">Review / employee</span>
              <Select
                value={selectedReview.id}
                onChange={setSelectedReviewId}
                ariaLabel="Select organization review to inspect"
              >
                {evaluations.map((evaluation) => (
                  <option key={evaluation.id} value={evaluation.id}>
                    {evaluation.intern} · {evaluation.status}
                  </option>
                ))}
              </Select>
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <TaskDetail label="Intern" value={selectedReview.intern} />
              <TaskDetail label="Mentor" value={selectedReview.mentor} />
              <TaskDetail
                label="Review cycle"
                value={cycle?.name ?? selectedReview.cycleId}
              />
              <TaskDetail
                label="Review status"
                value={selectedReview.status}
              />
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="text-sm font-semibold">Goals and evidence</div>
              <div className="mt-2 space-y-2">
                {selectedGoals.length > 0 ? (
                  selectedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-xl bg-neutral-50 p-3"
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-medium">{goal.title}</span>
                        <span className="font-semibold">{goal.progress}%</span>
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Evidence: {goal.successCriteria}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted">
                    No linked goal evidence is recorded.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <TaskDetail
                label="Rating"
                value={selectedReview.rating || "Not yet rated"}
              />
              <TaskDetail
                label="HR review / publishing status"
                value={selectedReview.status}
              />
              <TaskDetail
                label="Strengths"
                value={selectedReview.strengths || "No response recorded"}
              />
              <TaskDetail
                label="Areas for improvement"
                value={
                  selectedReview.areasForImprovement ||
                  "No response recorded"
                }
              />
              <TaskDetail
                label="Evaluation feedback"
                value={
                  selectedReview.overallFeedback || "No feedback recorded"
                }
              />
              <TaskDetail
                label="Development recommendations"
                value={
                  selectedReview.developmentRecommendations ||
                  "No response recorded"
                }
              />
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="text-sm font-semibold">
                Submission and complete review activity history
              </div>
              <div className="mt-2 divide-y divide-border">
                <div className="py-2 text-xs">
                  <span className="font-semibold">Evaluation created</span>
                  <span className="text-muted">
                    {" "}
                    · Assigned to {selectedReview.mentor}
                  </span>
                </div>
                {selectedHistory.map((event) => (
                  <div key={event.id} className="py-2 text-xs">
                    <span className="font-semibold">{event.event}</span>
                    <span className="text-muted">
                      {" "}
                      · {event.actor} · {event.timestamp ?? event.time}
                    </span>
                    {event.reason && (
                      <div className="mt-1 text-muted">
                        Reason: {event.reason}
                      </div>
                    )}
                    {event.previousStatus && (
                      <div className="mt-1 text-muted">
                        Preserved version status: {event.previousStatus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedReviewId(null)
                  setUnlockEvaluationId(selectedReview.id)
                  setUnlockReason("")
                }}
              >
                Unlock for re-review
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {unlockEvaluation && (
        <Modal
          onClose={() => {
            setUnlockEvaluationId(null)
            setUnlockReason("")
          }}
        >
          <div className="text-xl font-semibold">
            Unlock review for re-review?
          </div>
          <div className="mt-2 text-sm leading-6 text-muted">
            This is an exceptional administrative action. Unlocking a published
            or locked review allows the review workflow to be reopened for the
            intern.
          </div>
          <label className="mt-5 block">
            <span className="field-label">Reason for re-review *</span>
            <TextArea
              value={unlockReason}
              onChange={setUnlockReason}
              placeholder="Describe the administrative or review-process issue"
              ariaLabel="Reason for re-review"
              className="w-full"
            />
          </label>
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Use this action only when a valid administrative or review-process
            issue requires the evaluation to be reopened.
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setUnlockEvaluationId(null)
                setUnlockReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!unlockReason.trim()}
              onClick={() => {
                unlockReview(unlockEvaluation.id, unlockReason.trim())
                setUnlockEvaluationId(null)
                setUnlockReason("")
                setUnlockConfirmed(true)
              }}
            >
              Unlock for re-review
            </Button>
          </div>
        </Modal>
      )}

      {unlockConfirmed && (
        <Modal onClose={() => setUnlockConfirmed(false)}>
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-green-100 text-green-700">
            <Icon name="check" />
          </div>
          <div className="mt-5 text-center text-xl font-semibold">
            Review unlocked for re-review.
          </div>
          <div className="mt-2 text-center text-sm leading-6 text-muted">
            The original review remains preserved and the exceptional action
            has been added to the immutable audit trail.
          </div>
          <Button
            className="mt-6 w-full justify-center"
            onClick={() => setUnlockConfirmed(false)}
          >
            Continue
          </Button>
        </Modal>
      )}
    </>
  )
}

function SystemSettingsPage() {
  const settings = [
    {
      name: "Organization profile",
      status: "Primary",
      category: "Organization",
    },
    {
      name: "2025 Mid-year performance cycle",
      status: "Active",
      category: "Performance",
    },
    {
      name: "Notification preferences",
      status: "Active",
      category: "Notifications",
    },
    {
      name: "Review rating scale",
      status: "Review",
      category: "Review configuration",
    },
  ]
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [statusFilter, setStatusFilter] = useState("All")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openSettingMenu, setOpenSettingMenu] = useState<string | null>(null)
  const activeFilterCount =
    Number(categoryFilter !== "All categories") +
    Number(statusFilter !== "All")
  const visibleSettings = settings
    .filter((item) =>
      item.name.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .filter(
      (item) =>
        categoryFilter === "All categories" ||
        item.category === categoryFilter,
    )
    .filter(
      (item) => statusFilter === "All" || item.status === statusFilter,
    )

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            System Admin
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            System settings
          </div>
          <div className="mt-1 text-sm text-muted">
            Configure core workspace behavior and performance cycle defaults.
          </div>
        </div>
        <Button className="w-full justify-center sm:w-auto">
          <Icon name="plus" className="size-4" /> Create new
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.32fr] lg:items-start">
        <Card className="dashboard-compact-card">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-64 flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput
                value={search}
                onChange={setSearch}
                placeholder="Search system settings"
                className="w-full pl-9"
              />
            </div>
            {categoryFilter !== "All categories" && (
              <div className="skill-pill">
                <span>Category: {categoryFilter}</span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() => setCategoryFilter("All categories")}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            )}
            {statusFilter !== "All" && (
              <div className="skill-pill">
                <span>Status: {statusFilter}</span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() => setStatusFilter("All")}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            )}
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filter
                {activeFilterCount > 0 && (
                  <Badge tone="purple">{activeFilterCount}</Badge>
                )}
              </Button>
              {filtersOpen && (
                <Card className="absolute right-0 top-12 z-30 w-72 p-4 shadow-xl">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="field-label">Setting category</span>
                      <Select
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        ariaLabel="Filter settings by category"
                      >
                        <option>All categories</option>
                        <option>Organization</option>
                        <option>Performance</option>
                        <option>Notifications</option>
                        <option>Review configuration</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="field-label">Status</span>
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        ariaLabel="Filter settings by status"
                      >
                        <option>All</option>
                        <option>Active</option>
                        <option>Review</option>
                        <option>Inactive</option>
                      </Select>
                    </label>
                  </div>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCategoryFilter("All categories")
                        setStatusFilter("All")
                      }}
                    >
                      Clear all
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-3">
            {visibleSettings.length > 0 ? (
              visibleSettings.map((item) => (
                <div
                  key={item.name}
                  className="flex min-h-16 items-center justify-between gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700">
                      <Icon name="settings" className="size-4" />
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {item.name}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      tone={
                        item.status === "Primary"
                          ? "purple"
                          : item.status === "Review"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className="icon-button"
                        onClick={() =>
                          setOpenSettingMenu(
                            openSettingMenu === item.name ? null : item.name,
                          )
                        }
                      >
                        <Icon name="more" />
                      </Button>
                      {openSettingMenu === item.name && (
                        <Card className="absolute right-0 top-10 z-30 w-52 p-2 shadow-xl">
                          {[
                            "View details",
                            "Edit",
                            "Configure",
                            item.status === "Inactive" ? "Enable" : "Disable",
                            "Review",
                            "Restore defaults",
                          ].map((action) => (
                            <Button
                              key={action}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setOpenSettingMenu(null)}
                            >
                              {action}
                            </Button>
                          ))}
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No system settings match your search and filters.
              </div>
            )}
          </div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">At a glance</div>
          <div className="mt-3 text-3xl font-semibold">248</div>
          <div className="mt-1 text-xs text-muted">Managed identities</div>
          <div className="mt-2 text-xs text-muted">
            Accounts covered by system settings
          </div>
          <div className="mt-4 max-w-xs">
            <Progress value={94} />
          </div>
        </Card>
      </div>
    </>
  )
}

function AccessControlPage() {
  const controls = [
    {
      name: "MFA enforcement",
      setting: "Enabled",
      status: "Primary",
      type: "Authentication",
    },
    {
      name: "Session timeout",
      setting: "8 hours",
      status: "Active",
      type: "Session",
    },
    {
      name: "Failed login lockout",
      setting: "Enabled",
      status: "Active",
      type: "Account security",
    },
    {
      name: "Privileged access review",
      setting: "Due Oct 1",
      status: "Review",
      type: "Privileged access",
    },
  ]
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All control types")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openControlMenu, setOpenControlMenu] = useState<string | null>(null)
  const activeFilterCount =
    Number(statusFilter !== "All") +
    Number(typeFilter !== "All control types")
  const visibleControls = controls
    .filter((item) =>
      `${item.name} ${item.setting}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .filter(
      (item) => statusFilter === "All" || item.status === statusFilter,
    )
    .filter(
      (item) =>
        typeFilter === "All control types" || item.type === typeFilter,
    )

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            System Admin
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            Access control
          </div>
          <div className="mt-1 text-sm text-muted">
            Monitor account status, authentication policy, and privileged
            access.
          </div>
        </div>
        <Button className="w-full justify-center sm:w-auto">
          <Icon name="plus" className="size-4" /> Create new
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.32fr] lg:items-start">
        <Card className="dashboard-compact-card">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput
                value={search}
                onChange={setSearch}
                placeholder="Search access control"
                className="w-full pl-9"
              />
            </div>
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filter
                {activeFilterCount > 0 && (
                  <Badge tone="purple">{activeFilterCount}</Badge>
                )}
              </Button>
              {filtersOpen && (
                <Card className="absolute right-0 top-12 z-30 w-72 p-4 shadow-xl">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="field-label">Status</span>
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        ariaLabel="Filter access controls by status"
                      >
                        <option>All</option>
                        <option>Active</option>
                        <option>Review</option>
                        <option>Inactive</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="field-label">Control type</span>
                      <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        ariaLabel="Filter access controls by control type"
                      >
                        <option>All control types</option>
                        <option>Authentication</option>
                        <option>Session</option>
                        <option>Account security</option>
                        <option>Privileged access</option>
                      </Select>
                    </label>
                  </div>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStatusFilter("All")
                        setTypeFilter("All control types")
                      }}
                    >
                      Clear all
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilter !== "All" && (
                <div className="skill-pill">
                  <span>Status: {statusFilter}</span>
                  <Button
                    variant="ghost"
                    className="skill-action"
                    onClick={() => setStatusFilter("All")}
                  >
                    <Icon name="close" className="size-3" />
                  </Button>
                </div>
              )}
              {typeFilter !== "All control types" && (
                <div className="skill-pill">
                  <span>Control type: {typeFilter}</span>
                  <Button
                    variant="ghost"
                    className="skill-action"
                    onClick={() => setTypeFilter("All control types")}
                  >
                    <Icon name="close" className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="mt-3">
            {visibleControls.length > 0 ? (
              visibleControls.map((item) => (
                <div
                  key={item.name}
                  className="flex min-h-16 items-center justify-between gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700">
                      <Icon name="lock" className="size-4" />
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {item.name}{" "}
                      <span className="font-normal text-muted">
                        · {item.setting}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      tone={
                        item.status === "Primary"
                          ? "purple"
                          : item.status === "Review"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className="icon-button"
                        onClick={() =>
                          setOpenControlMenu(
                            openControlMenu === item.name ? null : item.name,
                          )
                        }
                      >
                        <Icon name="more" />
                      </Button>
                      {openControlMenu === item.name && (
                        <Card className="absolute right-0 top-10 z-30 w-52 p-2 shadow-xl">
                          {[
                            "View details",
                            "Edit policy",
                            item.setting === "Enabled" ? "Disable" : "Enable",
                            "Review",
                            "Restore defaults",
                          ].map((action) => (
                            <Button
                              key={action}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setOpenControlMenu(null)}
                            >
                              {action}
                            </Button>
                          ))}
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No access controls match your search and filters.
              </div>
            )}
          </div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">At a glance</div>
          <div className="mt-3 text-3xl font-semibold">248</div>
          <div className="mt-1 text-xs text-muted">Managed identities</div>
          <div className="mt-2 text-xs text-muted">
            Accounts covered by access policies
          </div>
          <div className="mt-4 max-w-xs">
            <Progress value={94} />
          </div>
        </Card>
      </div>
    </>
  )
}

function RoleManagementPage() {
  const roles = [
    { name: "Employee", users: 208, status: "Primary" },
    { name: "Mentor", users: 32, status: "Active" },
    { name: "HR", users: 5, status: "Active" },
    { name: "System Admin", users: 3, status: "Review" },
  ]
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null)
  const visibleRoles = roles
    .filter((item) =>
      `${item.name} ${item.users} users`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .filter(
      (item) => statusFilter === "All" || item.status === statusFilter,
    )

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            System Admin
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            Role management
          </div>
          <div className="mt-1 text-sm text-muted">
            Assign roles and inspect the permissions that shape each workspace.
          </div>
        </div>
        <Button className="w-full justify-center sm:w-auto">
          <Icon name="plus" className="size-4" /> Create new
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.32fr] lg:items-start">
        <Card className="dashboard-compact-card">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput
                value={search}
                onChange={setSearch}
                placeholder="Search role management"
                className="w-full pl-9"
              />
            </div>
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Filter
                {statusFilter !== "All" && (
                  <Badge tone="purple">1</Badge>
                )}
              </Button>
              {filtersOpen && (
                <Card className="absolute right-0 top-12 z-30 w-64 p-4 shadow-xl">
                  <label className="block">
                    <span className="field-label">Status</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      ariaLabel="Filter roles by status"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Review</option>
                      <option>Inactive</option>
                    </Select>
                  </label>
                  <div className="mt-4 flex justify-between gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setStatusFilter("All")}
                    >
                      Clear
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {statusFilter !== "All" && (
            <div className="mt-3 flex">
              <div className="skill-pill">
                <span>Status: {statusFilter}</span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() => setStatusFilter("All")}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3">
            {visibleRoles.length > 0 ? (
              visibleRoles.map((item) => (
                <div
                  key={item.name}
                  className="flex min-h-16 items-center justify-between gap-4 border-b border-border py-2.5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700">
                      <Icon name="shield" className="size-4" />
                    </div>
                    <div className="truncate text-sm font-semibold">
                      {item.name}{" "}
                      <span className="font-normal text-muted">
                        · {item.users} users
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      tone={
                        item.status === "Primary"
                          ? "purple"
                          : item.status === "Review"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className="icon-button"
                        onClick={() =>
                          setOpenRoleMenu(
                            openRoleMenu === item.name ? null : item.name,
                          )
                        }
                      >
                        <Icon name="more" />
                      </Button>
                      {openRoleMenu === item.name && (
                        <Card className="absolute right-0 top-10 z-30 w-52 p-2 shadow-xl">
                          {[
                            "View permissions",
                            "Edit role",
                            "Manage users",
                            "Duplicate role",
                            "Deactivate role",
                          ].map((action) => (
                            <Button
                              key={action}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setOpenRoleMenu(null)}
                            >
                              {action}
                            </Button>
                          ))}
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No roles match your search and filter.
              </div>
            )}
          </div>
        </Card>

        <Card className="dashboard-compact-card">
          <div className="text-base font-semibold">At a glance</div>
          <div className="mt-3 text-3xl font-semibold">248</div>
          <div className="mt-1 text-xs text-muted">Managed identities</div>
          <div className="mt-4 max-w-xs">
            <Progress value={94} />
          </div>
        </Card>
      </div>
    </>
  )
}

function UserManagementPage({
  users,
  addUser,
  toggleUser,
}: {
  users: DemoUser[]
  addUser: () => void
  toggleUser: (email: string) => void
}) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [statusFilter, setStatusFilter] = useState("All statuses")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount =
    Number(roleFilter !== "All roles") +
    Number(statusFilter !== "All statuses")
  const visibleUsers = users
    .filter((user) =>
      `${user.name} ${user.email}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    .filter((user) => roleFilter === "All roles" || user.role === roleFilter)
    .filter(
      (user) =>
        statusFilter === "All statuses" ||
        (statusFilter === "Active"
          ? user.status === "Active"
          : user.status !== "Active"),
    )

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-600">
            Identity administration
          </div>
          <div className="text-3xl font-semibold tracking-tight text-ink">
            User management
          </div>
          <div className="mt-1 text-sm text-muted">
            Create, update, and control access for every Performax account.
          </div>
        </div>
        <Button
          onClick={addUser}
          className="w-full justify-center sm:w-auto"
        >
          <Icon name="plus" className="size-4" /> Add user
        </Button>
      </div>

      <Card className="dashboard-compact-card">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name or email"
              className="w-full pl-9"
            />
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters
              {activeFilterCount > 0 && (
                <Badge tone="purple">{activeFilterCount}</Badge>
              )}
            </Button>
            {filtersOpen && (
              <Card className="absolute right-0 top-12 z-30 w-72 p-4 shadow-xl">
                <div className="mb-3 text-sm font-semibold">Filter users</div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="field-label">Role</span>
                    <Select
                      value={roleFilter}
                      onChange={setRoleFilter}
                      ariaLabel="Filter users by role"
                    >
                      <option>All roles</option>
                      <option>System Admin</option>
                      <option>HR</option>
                      <option>Mentor</option>
                      <option>Employee</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="field-label">Status</span>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      ariaLabel="Filter users by status"
                    >
                      <option>All statuses</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </Select>
                  </label>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRoleFilter("All roles")
                      setStatusFilter("All statuses")
                    }}
                  >
                    Clear all
                  </Button>
                  <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {roleFilter !== "All roles" && (
              <div className="skill-pill">
                <span>Role: {roleFilter}</span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() => setRoleFilter("All roles")}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            )}
            {statusFilter !== "All statuses" && (
              <div className="skill-pill">
                <span>Status: {statusFilter}</span>
                <Button
                  variant="ghost"
                  className="skill-action"
                  onClick={() => setStatusFilter("All statuses")}
                >
                  <Icon name="close" className="size-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 hidden grid-cols-[minmax(0,1.5fr)_minmax(0,.55fr)_minmax(0,.45fr)_auto] items-center gap-4 border-b border-border py-2 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {visibleUsers.length > 0 ? (
          visibleUsers.map((user) => (
            <div
              key={user.email}
              className="grid min-h-16 gap-2 border-b border-border py-2.5 last:border-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,.55fr)_minmax(0,.45fr)_auto] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={user.initials} small />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {user.name}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {user.email}
                  </div>
                </div>
              </div>
              <span className="text-sm">{user.role}</span>
              <div>
                <Badge tone={user.status === "Active" ? "green" : "neutral"}>
                  {user.status}
                </Badge>
              </div>
              <Button
                variant="secondary"
                onClick={() => toggleUser(user.email)}
              >
                {user.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted">
            No users match your search and filters.
          </div>
        )}
      </Card>
    </>
  )
}

function ManagementPage({
  role,
  page,
  reviewState,
  submitReview,
  publishReview,
  users,
  addUser,
  toggleUser,
  mentorGoals,
  assignMentorGoal,
  updateMentorGoal,
  reviewCycle,
  mentorEvaluations,
  updateMentorEvaluation,
  submitMentorEvaluation,
  reviewCycles,
  createEvaluationCycle,
  updateEvaluationCycle,
  updateEvaluationStatus,
  auditEvents,
  unlockEvaluationReview,
}: {
  role: Role
  page: string
  reviewState: ReviewState
  submitReview: () => void
  publishReview: () => void
  users: DemoUser[]
  addUser: () => void
  toggleUser: (email: string) => void
  mentorGoals: MentorGoal[]
  assignMentorGoal: (goal: MentorGoal) => void
  updateMentorGoal: (goalId: string, updates: Partial<MentorGoal>) => void
  reviewCycle: ReviewCycle | null
  mentorEvaluations: MentorEvaluation[]
  updateMentorEvaluation: (
    evaluationId: string,
    updates: Partial<MentorEvaluation>,
  ) => void
  submitMentorEvaluation: (evaluationId: string) => void
  reviewCycles: ReviewCycle[]
  createEvaluationCycle: (cycle: ReviewCycle) => void
  updateEvaluationCycle: (
    cycleId: string,
    updates: Partial<ReviewCycle>,
  ) => void
  updateEvaluationStatus: (
    evaluationId: string,
    status: EvaluationStatus,
  ) => void
  auditEvents: AuditEvent[]
  unlockEvaluationReview: (evaluationId: string, reason: string) => void
}) {
  if (page === "Profile") return <ProfilePage role={role} />
  if (role === "hr" && page === "Employees") return <HREmployeesPage />
  if (role === "mentor" && page === "My Team") return <MentorTeamPage />
  if (role === "mentor" && page === "Goals")
    return (
      <MentorGoalsPage
        goals={mentorGoals}
        assignGoal={assignMentorGoal}
        updateGoal={updateMentorGoal}
      />
    )
  if (role === "mentor" && page === "Performance Evaluations")
    return (
      <MentorEvaluationsPage
        cycle={reviewCycle}
        evaluations={mentorEvaluations}
        goals={mentorGoals}
        updateEvaluation={updateMentorEvaluation}
        submitEvaluation={submitMentorEvaluation}
      />
    )
  if (role === "hr" && page === "Performance Reviews")
    return (
      <HRPerformanceReviewsPage
        cycles={reviewCycles}
        evaluations={mentorEvaluations}
        goals={mentorGoals}
        updateEvaluation={updateMentorEvaluation}
        updateStatus={updateEvaluationStatus}
      />
    )
  if (role === "hr" && page === "Review Management")
    return (
      <HRReviewManagementPage
        cycles={reviewCycles}
        evaluations={mentorEvaluations}
        createCycle={createEvaluationCycle}
        updateCycle={updateEvaluationCycle}
      />
    )
  if (role === "admin" && page === "User Management") {
    return (
      <UserManagementPage
        users={users}
        addUser={addUser}
        toggleUser={toggleUser}
      />
    )
  }
  if (role === "admin" && page === "Role Management") {
    return <RoleManagementPage />
  }
  if (role === "admin" && page === "Access Control") {
    return <AccessControlPage />
  }
  if (role === "admin" && page === "System Settings") {
    return <SystemSettingsPage />
  }
  if (role === "admin" && page === "Audit Logs") {
    return (
      <AuditLogsPage
        events={auditEvents}
        evaluations={mentorEvaluations}
        goals={mentorGoals}
        cycle={reviewCycle}
        unlockReview={unlockEvaluationReview}
      />
    )
  }
  if (
    (role === "mentor" &&
      (page === "Performance Evaluations" || page === "Reviews")) ||
    (role === "hr" &&
      (page === "Performance Reviews" || page === "Review Management"))
  ) {
    const isHR = role === "hr"
    return (
      <>
        <PageIntro
          eyebrow={isHR ? "Review governance" : "Team evaluations"}
          title={isHR ? "Review management" : "Performance evaluations"}
          copy={
            isHR
              ? "Control quality, status, and employee visibility for every performance review."
              : "Complete thoughtful evaluations and submit them to HR for review."
          }
        />
        <Card>
          <SectionTitle
            title="Alex Morgan · 2025 Mid-year"
            action={
              <Badge
                tone={
                  reviewState === "draft"
                    ? "amber"
                    : reviewState === "submitted"
                      ? "blue"
                      : "green"
                }
              >
                {reviewState === "draft"
                  ? "Draft"
                  : reviewState === "submitted"
                    ? "Pending HR Review"
                    : "Published"}
              </Badge>
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="stat-tile">
              <span>Overall rating</span>
              <strong>4.4 / 5</strong>
            </div>
            <div className="stat-tile">
              <span>Goals completed</span>
              <strong>84%</strong>
            </div>
            <div className="stat-tile">
              <span>Review period</span>
              <strong>H1 2025</strong>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-neutral-50 p-5">
            <div className="text-sm font-semibold">Evaluation feedback</div>
            <div className="mt-2 text-sm leading-6 text-muted">
              Alex consistently turns ambiguity into well-framed research
              questions and practical product improvements. Their impact is
              above expectations for this review period.
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            {!isHR && reviewState === "draft" && (
              <Button onClick={submitReview}>Submit evaluation to HR</Button>
            )}
            {isHR && reviewState === "submitted" && (
              <Button onClick={publishReview}>
                Approve & publish to employee
              </Button>
            )}
            <Button variant="secondary">View goal evidence</Button>
          </div>
        </Card>
      </>
    )
  }
  const configs: Record<string, {
    title: string
    copy: string
    icon: IconName
    items: string[]
  }> = {
    "My Team": {
      title: "My team",
      copy: "A clear view of each person’s progress, priorities, and support needs.",
      icon: "users",
      items: [
        "Alex Morgan · On track",
        "Maya Chen · Needs attention",
        "Noah Williams · On track",
        "Priya Rao · At risk",
      ],
    },
    Goals: {
      title: "Team goals",
      copy: "Align individual outcomes with team and organization priorities.",
      icon: "target",
      items: [
        "Improve customer onboarding",
        "Launch mobile beta",
        "Scale the design system",
        "Increase research cadence",
      ],
    },
    Employees: {
      title: "Employees",
      copy: "View performance participation and review readiness across the organization.",
      icon: "users",
      items: [
        "Product · 42 employees",
        "Engineering · 96 employees",
        "Marketing · 38 employees",
        "Operations · 72 employees",
      ],
    },
    "Performance Overview": {
      title: "Performance overview",
      copy: "Understand organizational trends without losing sight of individual growth.",
      icon: "chart",
      items: [
        "Exceeds expectations · 28%",
        "Meets expectations · 57%",
        "Developing · 12%",
        "Needs support · 3%",
      ],
    },
    "Role Management": {
      title: "Role management",
      copy: "Assign roles and inspect the permissions that shape each workspace.",
      icon: "shield",
      items: [
        "Employee · 208 users",
        "Mentor · 32 users",
        "HR · 5 users",
        "System Admin · 3 users",
      ],
    },
    "Access Control": {
      title: "Access control",
      copy: "Monitor account status, authentication policy, and privileged access.",
      icon: "lock",
      items: [
        "MFA enforcement · Enabled",
        "Session timeout · 8 hours",
        "Failed login lockout · Enabled",
        "Privileged access review · Due Oct 1",
      ],
    },
    "System Settings": {
      title: "System settings",
      copy: "Configure core workspace behavior and performance cycle defaults.",
      icon: "settings",
      items: [
        "Organization profile",
        "2025 Mid-year performance cycle",
        "Notification preferences",
        "Review rating scale",
      ],
    },
    "Audit Logs": {
      title: "Audit logs",
      copy: "Trace identity, access, and review actions across Performax.",
      icon: "audit",
      items: [
        "Role changed · Nadia Patel · 21m ago",
        "User created · Ava Robinson · 1h ago",
        "Account deactivated · Yesterday",
        "Review published · Yesterday",
      ],
    },
  }
  const config = configs[page] ?? configs["My Team"]
  return (
    <>
      <PageIntro
        eyebrow={roleMeta[role].label}
        title={config.title}
        copy={config.copy}
        action={
          <Button>
            <Icon name="plus" className="size-4" /> Create new
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
        <Card>
          <div className="flex gap-3 border-b border-border pb-5">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <TextInput
                placeholder={`Search ${config.title.toLowerCase()}`}
                className="w-full pl-9"
              />
            </div>
            <Button variant="secondary">Filter</Button>
          </div>
          {config.items.map((item, index) => (
            <div
              key={item}
              className="flex items-center justify-between border-b border-border py-5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-neutral-100 text-muted">
                  <Icon name={config.icon} className="size-4" />
                </div>
                <div className="text-sm font-semibold">{item}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  tone={
                    index === 0 ? "purple" : index === 3 ? "amber" : "neutral"
                  }
                >
                  {index === 0 ? "Primary" : index === 3 ? "Review" : "Active"}
                </Badge>
                <Button variant="ghost" className="icon-button">
                  <Icon name="more" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionTitle title="At a glance" />
          <div className="text-4xl font-semibold">
            {role === "admin" ? "248" : role === "hr" ? "94%" : "82%"}
          </div>
          <div className="mt-2 text-sm text-muted">
            {role === "admin"
              ? "Managed identities"
              : role === "hr"
                ? "Cycle participation"
                : "Goals on track"}
          </div>
          <div className="mt-6">
            <Progress value={role === "mentor" ? 82 : 94} />
          </div>
        </Card>
      </div>
    </>
  )
}

function ProfilePage({ role }: { role: Role }) {
  const [section, setSection] = useState("A")
  const [subSection, setSubSection] = useState("A1")
  const [skills, setSkills] = useState([
    "Python",
    "Machine Learning",
    "SQL",
    "Data Analysis",
  ])
  const [skillDraft, setSkillDraft] = useState("")
  const [skillEditorOpen, setSkillEditorOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<number | null>(null)
  const subSections: Record<string, string[]> = {
    A: ["A1", "A2"],
    B: ["B1", "B2"],
    C: ["C1", "C2"],
    D: ["D1", "D2"],
  }
  const saveSkill = () => {
    const nextSkill = skillDraft.trim()
    if (!nextSkill) return
    if (editingSkill === null) {
      if (
        !skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())
      ) {
        setSkills((current) => [...current, nextSkill])
      }
    } else {
      setSkills((current) =>
        current.map((skill, index) =>
          index === editingSkill ? nextSkill : skill,
        ),
      )
    }
    setSkillDraft("")
    setEditingSkill(null)
    setSkillEditorOpen(false)
  }
  const editSkill = (index: number) => {
    setSkillDraft(skills[index])
    setEditingSkill(index)
    setSkillEditorOpen(true)
  }
  const removeSkill = (index: number) => {
    setSkills((current) =>
      current.filter((_, skillIndex) => skillIndex !== index),
    )
    if (editingSkill === index) {
      setSkillDraft("")
      setEditingSkill(null)
      setSkillEditorOpen(false)
    }
  }
  const data: Record<Role, [string, string, string]> = {
    employee: ["Alex Morgan", "Product Design Intern", "Product"],
    mentor: ["Daniel Ortiz", "Product Director", "Product"],
    hr: ["Nadia Patel", "People Operations Lead", "People & Culture"],
    admin: ["Kai Stewart", "Systems Administrator", "Technology"],
  }

  if (role === "employee") {
    return (
      <>
        <PageIntro
          eyebrow="Profile"
          title="Your profile"
          copy="Keep your personal details and capabilities up to date."
        />
        <div className="grid gap-6 xl:grid-cols-[0.68fr_0.32fr]">
          <Card>
            <SectionTitle title="Basic Information" />
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Full Name</span>
                <TextInput value="Alex Morgan" />
              </label>
              <label>
                <span className="field-label">Email</span>
                <TextInput value="alex.morgan@dailoqa.com" />
              </label>
              <label>
                <span className="field-label">Section</span>
                <Select
                  value={section}
                  onChange={(value) => {
                    setSection(value)
                    setSubSection(subSections[value][0])
                  }}
                  ariaLabel="Select section"
                >
                  {["A", "B", "C", "D"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                <span className="field-label">Sub-section</span>
                <Select
                  value={subSection}
                  onChange={setSubSection}
                  ariaLabel="Select sub-section"
                >
                  {subSections[section].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <Button className="mt-6">Save changes</Button>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold tracking-tight text-ink">
                  Skills
                </div>
                <div className="mt-1 text-xs text-muted">Employee / Intern</div>
              </div>
              {!skillEditorOpen && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingSkill(null)
                    setSkillDraft("")
                    setSkillEditorOpen(true)
                  }}
                >
                  <Icon name="plus" className="size-4" /> Add skill
                </Button>
              )}
            </div>
            <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted">
              Your Skills
            </div>
            {skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div key={`${skill}-${index}`} className="skill-pill">
                    <span>{skill}</span>
                    <Button
                      variant="ghost"
                      className="skill-action"
                      onClick={() => editSkill(index)}
                    >
                      <Icon name="edit" className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="skill-action"
                      onClick={() => removeSkill(index)}
                    >
                      <Icon name="close" className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted">
                No skills added yet.
              </div>
            )}
            {skillEditorOpen && (
              <div className="mt-5 rounded-xl bg-neutral-50 p-4">
                <label>
                  <span className="field-label">
                    {editingSkill === null ? "Add a skill" : "Update skill"}
                  </span>
                  <TextInput
                    value={skillDraft}
                    onChange={setSkillDraft}
                    placeholder="e.g. React"
                    className="w-full"
                  />
                </label>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSkillDraft("")
                      setEditingSkill(null)
                      setSkillEditorOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveSkill}>
                    {editingSkill === null ? "Add skill" : "Update skill"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageIntro
        eyebrow="Account"
        title="Profile"
        copy="Manage your personal information and workspace preferences."
      />
      <div className="grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
        <Card className="text-center">
          <Avatar initials={roleMeta[role].initials} />
          <div className="mt-4 text-lg font-semibold">{data[role][0]}</div>
          <div className="mt-1 text-sm text-muted">{data[role][1]}</div>
          <div className="mt-4">
            <Badge tone="purple">{roleMeta[role].label}</Badge>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Profile information" />
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="field-label">Full name</span>
              <TextInput value={data[role][0]} />
            </label>
            <label>
              <span className="field-label">Job title</span>
              <TextInput value={data[role][1]} />
            </label>
            <label>
              <span className="field-label">Department</span>
              <TextInput value={data[role][2]} />
            </label>
            <label>
              <span className="field-label">Email</span>
              <TextInput
                value={`${data[role][0].toLowerCase().replace(" ", ".")}@dailoqa.com`}
              />
            </label>
          </div>
          <Button className="mt-6">Save changes</Button>
        </Card>
      </div>
    </>
  )
}

function MentorTeamPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedIntern, setSelectedIntern] = useState<string | null>(null)
  const interns = [
    {
      name: "Alex Morgan",
      initials: "AM",
      section: "Section A · A1",
      progress: 76,
      status: "On track",
      action: "View profile",
    },
    {
      name: "Maya Chen",
      initials: "MC",
      section: "Section B · B2",
      progress: 68,
      status: "Needs attention",
      action: "Review",
    },
    {
      name: "Noah Williams",
      initials: "NW",
      section: "Section C · C1",
      progress: 88,
      status: "On track",
      action: "View profile",
    },
    {
      name: "Priya Rao",
      initials: "PR",
      section: "Section D · D2",
      progress: 54,
      status: "At risk",
      action: "Review",
    },
  ]
  const visibleInterns = interns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || intern.status === statusFilter),
  )
  const currentIntern =
    interns.find((intern) => intern.name === selectedIntern) ?? null
  const statusTone = (status: string): "green" | "purple" | "red" =>
    status === "On track"
      ? "green"
      : status === "Needs attention"
        ? "purple"
        : "red"

  return (
    <>
      <PageIntro
        eyebrow="Mentor workspace"
        title="My Team"
        copy="View your interns, their progress, and areas that need your support."
      />
      <Card>
        <div className="grid gap-3 border-b border-border pb-5 sm:grid-cols-[1fr_12rem]">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search my team"
              className="w-full pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter team"
          >
            <option value="All">Filter: All</option>
            <option value="On track">Filter: On track</option>
            <option value="Needs attention">Filter: Needs attention</option>
            <option value="At risk">Filter: At risk</option>
          </Select>
        </div>
        <div className="mt-2">
          {visibleInterns.map((intern) => (
            <div
              key={intern.name}
              className="grid gap-3 border-b border-border py-4 last:border-0 md:grid-cols-[minmax(13rem,1.2fr)_minmax(10rem,0.8fr)_auto_auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={intern.initials} small />
                <div>
                  <div className="text-sm font-semibold">{intern.name}</div>
                  <div className="mt-1 text-xs text-muted">
                    {intern.section}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-muted">
                  <span>Goal progress</span>
                  <strong className="text-ink">{intern.progress}%</strong>
                </div>
                <Progress value={intern.progress} />
              </div>
              <Badge tone={statusTone(intern.status)}>{intern.status}</Badge>
              <Button
                variant="ghost"
                className="justify-start px-0 text-purple-700 md:justify-end"
                onClick={() => setSelectedIntern(intern.name)}
              >
                {intern.action} <Icon name="arrow" className="size-4" />
              </Button>
            </div>
          ))}
          {visibleInterns.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-neutral-100 text-muted">
                <Icon name="users" />
              </div>
              <div className="mt-3 text-sm font-semibold">
                No matching interns
              </div>
              <div className="mt-1 text-xs text-muted">
                Try adjusting your search or filter.
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <div className="text-base font-semibold">At a glance</div>
        <div className="mt-3 grid grid-cols-3 divide-x divide-border">
          <CompactMetric label="Goals on track" value="82%" tone="green" />
          <CompactMetric label="Pending reviews" value="2" tone="amber" />
          <CompactMetric label="Needs attention" value="1" />
        </div>
      </Card>

      {currentIntern && (
        <Modal onClose={() => setSelectedIntern(null)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar initials={currentIntern.initials} />
              <div>
                <div className="text-xl font-semibold tracking-tight">
                  {currentIntern.name}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {currentIntern.section}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="icon-button"
              onClick={() => setSelectedIntern(null)}
            >
              <Icon name="close" className="size-4" />
            </Button>
          </div>
          <div className="mt-6 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Goal progress</span>
              <strong>{currentIntern.progress}%</strong>
            </div>
            <div className="mt-3">
              <Progress value={currentIntern.progress} />
            </div>
            <div className="mt-4">
              <Badge tone={statusTone(currentIntern.status)}>
                {currentIntern.status}
              </Badge>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setSelectedIntern(null)}>
              {currentIntern.action === "Review"
                ? "Open review"
                : "Close profile"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function MentorGoalsPage({
  goals = initialMentorGoals,
  assignGoal = () => undefined,
  updateGoal = () => undefined,
}: {
  goals?: MentorGoal[]
  assignGoal?: (goal: MentorGoal) => void
  updateGoal?: (goalId: string, updates: Partial<MentorGoal>) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [internDraft, setInternDraft] = useState("")
  const [titleDraft, setTitleDraft] = useState("")
  const [descriptionDraft, setDescriptionDraft] = useState("")
  const [dueDateDraft, setDueDateDraft] = useState("")
  const [priorityDraft, setPriorityDraft] = useState<TaskPriority>("Medium")
  const [categoryDraft, setCategoryDraft] = useState("Development")
  const [criteriaDraft, setCriteriaDraft] = useState("")
  const interns = [
    { name: "Alex Morgan", section: "Section A · A1", initials: "AM" },
    { name: "Maya Chen", section: "Section B · B2", initials: "MC" },
    { name: "Noah Williams", section: "Section C · C1", initials: "NW" },
    { name: "Priya Rao", section: "Section D · D2", initials: "PR" },
  ]
  const visibleGoals = goals.filter(
    (goal) =>
      `${goal.title} ${goal.intern}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (statusFilter === "All" || goal.status === statusFilter),
  )
  const currentGoal = goals.find((goal) => goal.id === selectedGoal) ?? null
  const statusTone = (status: string): "green" | "purple" | "red" =>
    status === "On track" || status === "Completed"
      ? "green"
      : status === "At risk"
        ? "red"
        : "purple"
  const resetDrafts = () => {
    setInternDraft("")
    setTitleDraft("")
    setDescriptionDraft("")
    setDueDateDraft("")
    setPriorityDraft("Medium")
    setCategoryDraft("Development")
    setCriteriaDraft("")
  }
  const saveAssignment = () => {
    const intern = interns.find((item) => item.name === internDraft)
    if (!intern || !titleDraft.trim()) return
    assignGoal({
      id: `mentor-goal-${Date.now()}`,
      title: titleDraft.trim(),
      description: descriptionDraft.trim() || "Goal assigned by Mentor.",
      intern: intern.name,
      section: intern.section,
      initials: intern.initials,
      progress: 0,
      status: "Upcoming",
      dueDate: dueDateDraft.trim() || "Not set",
      priority: priorityDraft,
      category: categoryDraft,
      successCriteria: criteriaDraft.trim(),
    })
    resetDrafts()
    setAssignOpen(false)
  }
  const beginEdit = () => {
    if (!currentGoal) return
    setInternDraft(currentGoal.intern)
    setTitleDraft(currentGoal.title)
    setDescriptionDraft(currentGoal.description)
    setDueDateDraft(currentGoal.dueDate)
    setPriorityDraft(currentGoal.priority)
    setCategoryDraft(currentGoal.category)
    setCriteriaDraft(currentGoal.successCriteria)
    setEditOpen(true)
  }
  const saveEdit = () => {
    if (!currentGoal) return
    const intern = interns.find((item) => item.name === internDraft)
    updateGoal(currentGoal.id, {
      title: titleDraft.trim() || currentGoal.title,
      description: descriptionDraft.trim(),
      dueDate: dueDateDraft.trim() || currentGoal.dueDate,
      priority: priorityDraft,
      category: categoryDraft,
      successCriteria: criteriaDraft.trim(),
      ...(intern
        ? {
            intern: intern.name,
            section: intern.section,
            initials: intern.initials,
          }
        : {}),
    })
    setEditOpen(false)
  }

  return (
    <>
      <PageIntro
        eyebrow="Mentor workspace"
        title="Intern goals"
        copy="Assign goals to your interns and track their progress."
        action={
          <Button
            onClick={() => {
              resetDrafts()
              setAssignOpen(true)
            }}
          >
            <Icon name="plus" className="size-4" /> Assign goal
          </Button>
        }
      />
      <Card>
        <div className="grid gap-3 border-b border-border pb-5 sm:grid-cols-[1fr_12rem]">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <TextInput
              value={search}
              onChange={setSearch}
              placeholder="Search intern goals"
              className="w-full pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="Filter intern goals"
          >
            <option value="All">Filter: All</option>
            <option value="On track">Filter: On track</option>
            <option value="Needs attention">Filter: Needs attention</option>
            <option value="At risk">Filter: At risk</option>
            <option value="Upcoming">Filter: Upcoming</option>
            <option value="In progress">Filter: In progress</option>
            <option value="Completed">Filter: Completed</option>
          </Select>
        </div>
        <div className="mt-2">
          {visibleGoals.map((goal) => (
            <div
              key={goal.id}
              className="grid gap-3 border-b border-border py-4 last:border-0 md:grid-cols-[minmax(14rem,1.25fr)_minmax(10rem,0.75fr)_auto_auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="goal-icon">
                  <Icon name="target" className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{goal.title}</div>
                  <div className="mt-1 text-xs text-muted">
                    {goal.intern} · {goal.section}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs text-muted">
                  <span>Progress</span>
                  <strong className="text-ink">{goal.progress}%</strong>
                </div>
                <Progress value={goal.progress} />
              </div>
              <Badge tone={statusTone(goal.status)}>{goal.status}</Badge>
              <Button
                variant="ghost"
                className="justify-start px-0 text-purple-700 md:justify-end"
                onClick={() => {
                  setSelectedGoal(goal.id)
                  setEditOpen(false)
                }}
              >
                {goal.status === "At risk" ? "Review" : "View goal"}{" "}
                <Icon name="arrow" className="size-4" />
              </Button>
            </div>
          ))}
          {visibleGoals.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-neutral-100 text-muted">
                <Icon name="target" />
              </div>
              <div className="mt-3 text-sm font-semibold">
                No matching goals
              </div>
              <div className="mt-1 text-xs text-muted">
                Try adjusting your search or filter.
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 dashboard-compact-card">
        <div className="text-base font-semibold">At a glance</div>
        <div className="mt-3 grid grid-cols-3 divide-x divide-border">
          <CompactMetric label="Goals on track" value="82%" tone="green" />
          <CompactMetric label="Goals needing attention" value="3" />
          <CompactMetric label="Goal at risk" value="1" tone="amber" />
        </div>
        <div className="mt-3">
          <Progress value={82} />
        </div>
      </Card>

      {currentGoal && (
        <Modal onClose={() => setSelectedGoal(null)}>
          {!editOpen ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone={statusTone(currentGoal.status)}>
                    {currentGoal.status}
                  </Badge>
                  <div className="mt-3 text-xl font-semibold tracking-tight">
                    {currentGoal.title}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {currentGoal.intern} · {currentGoal.section}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="icon-button"
                  onClick={() => setSelectedGoal(null)}
                >
                  <Icon name="close" className="size-4" />
                </Button>
              </div>
              <div className="mt-4 text-sm leading-6 text-muted">
                {currentGoal.description}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4">
                <TaskDetail label="Due date" value={currentGoal.dueDate} />
                <TaskDetail label="Priority" value={currentGoal.priority} />
                <TaskDetail label="Category" value={currentGoal.category} />
                <TaskDetail
                  label="Success criteria"
                  value={currentGoal.successCriteria || "Not specified"}
                />
              </div>
              <div className="mt-5 rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Goal progress</span>
                  <strong>{currentGoal.progress}%</strong>
                </div>
                <div className="mt-3">
                  <Progress
                    value={currentGoal.progress}
                    tone={
                      currentGoal.status === "Completed" ? "green" : "purple"
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={beginEdit}>
                  <Icon name="edit" className="size-4" /> Edit goal
                </Button>
                <Button
                  onClick={() =>
                    updateGoal(currentGoal.id, {
                      progress: 100,
                      status: "Completed",
                    })
                  }
                >
                  <Icon name="check" className="size-4" /> Mark complete
                </Button>
              </div>
            </>
          ) : (
            <>
              <SectionTitle
                title="Edit assigned goal"
                eyebrow="Mentor workspace"
              />
              <MentorGoalFields
                interns={interns}
                intern={internDraft}
                setIntern={setInternDraft}
                title={titleDraft}
                setTitle={setTitleDraft}
                description={descriptionDraft}
                setDescription={setDescriptionDraft}
                dueDate={dueDateDraft}
                setDueDate={setDueDateDraft}
                priority={priorityDraft}
                setPriority={setPriorityDraft}
                category={categoryDraft}
                setCategory={setCategoryDraft}
                criteria={criteriaDraft}
                setCriteria={setCriteriaDraft}
              />
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>Save changes</Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {assignOpen && (
        <Modal onClose={() => setAssignOpen(false)}>
          <SectionTitle title="Assign goal" eyebrow="Mentor workspace" />
          <MentorGoalFields
            interns={interns}
            intern={internDraft}
            setIntern={setInternDraft}
            title={titleDraft}
            setTitle={setTitleDraft}
            description={descriptionDraft}
            setDescription={setDescriptionDraft}
            dueDate={dueDateDraft}
            setDueDate={setDueDateDraft}
            priority={priorityDraft}
            setPriority={setPriorityDraft}
            category={categoryDraft}
            setCategory={setCategoryDraft}
            criteria={criteriaDraft}
            setCriteria={setCriteriaDraft}
          />
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveAssignment}
              disabled={!internDraft || !titleDraft.trim()}
            >
              Assign goal
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function MentorGoalFields({
  interns,
  intern,
  setIntern,
  title,
  setTitle,
  description,
  setDescription,
  dueDate,
  setDueDate,
  priority,
  setPriority,
  category,
  setCategory,
  criteria,
  setCriteria,
}: {
  interns: { name: string section: string initials: string }[]
  intern: string
  setIntern: (value: string) => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  dueDate: string
  setDueDate: (value: string) => void
  priority: TaskPriority
  setPriority: (value: TaskPriority) => void
  category: string
  setCategory: (value: string) => void
  criteria: string
  setCriteria: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="field-label">Select intern</span>
        <Select value={intern} onChange={setIntern} ariaLabel="Select intern">
          <option value="">Select an intern</option>
          {interns.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} · {item.section}
            </option>
          ))}
        </Select>
      </label>
      <label className="block">
        <span className="field-label">Goal title</span>
        <TextInput
          value={title}
          onChange={setTitle}
          placeholder="Enter a clear goal title"
        />
      </label>
      <label className="block">
        <span className="field-label">Goal description</span>
        <TextInput
          value={description}
          onChange={setDescription}
          placeholder="Describe the expected outcome"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label">Due date</span>
          <TextInput
            value={dueDate}
            onChange={setDueDate}
            placeholder="e.g. Dec 15, 2025"
          />
        </label>
        <label>
          <span className="field-label">Priority</span>
          <Select
            value={priority}
            onChange={(value) => setPriority(value as TaskPriority)}
            ariaLabel="Select priority"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
        </label>
      </div>
      <label className="block">
        <span className="field-label">Goal category</span>
        <TextInput
          value={category}
          onChange={setCategory}
          placeholder="e.g. Development"
        />
      </label>
      <label className="block">
        <span className="field-label">Success criteria (optional)</span>
        <TextInput
          value={criteria}
          onChange={setCriteria}
          placeholder="How will success be measured?"
        />
      </label>
    </div>
  )
}

function Modal({
  children,
  onClose,
  className = "",
}: {
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card className={`w-full max-w-md shadow-2xl ${className}`}>
        <div onClick={(event) => event.stopPropagation()}>{children}</div>
      </Card>
    </div>
  )
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [active, setActive] = useState("Dashboard")
  const [reviewState, setReviewState] = useState<ReviewState>("draft")
  const [employeeTasks, setEmployeeTasks] =
    useState<EmployeeTask[]>(initialEmployeeTasks)
  const [employeeGoals, setEmployeeGoals] =
    useState<EmployeeGoal[]>(initialEmployeeGoals)
  const [mentorGoals, setMentorGoals] =
    useState<MentorGoal[]>(initialMentorGoals)
  const [mentorEvaluations, setMentorEvaluations] =
    useState<MentorEvaluation[]>(initialMentorEvaluations)
  const [auditEvents, setAuditEvents] =
    useState<AuditEvent[]>(initialAuditEvents)
  const [evaluationCycles, setEvaluationCycles] = useState<ReviewCycle[]>([
    {
      id: "cycle-midyear",
      name: "Mid-Year Performance Review",
      startDate: "January 1, 2025",
      endDate: "June 30, 2025",
      applicableEmployees: ["EMP-1042", "EMP-1048", "EMP-1061", "EMP-1072"],
      eligiblePopulation: "All interns",
      status: "Open",
      publicationStatus: "draft",
    },
  ])
  const [taskNotification, setTaskNotification] = useState<string | null>(null)
  const [goalNotification, setGoalNotification] = useState<string | null>(null)
  const [progressGoal, setProgressGoal] = useState("onboarding-research")
  const [progressValue, setProgressValue] = useState("76")
  const [modal, setModal] = useState<"addUser" | "message" | "progress" | null>(
    null,
  )
  const [message, setMessage] = useState("")
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState("Employee")
  const [users, setUsers] = useState<DemoUser[]>([
    {
      name: "Kai Stewart",
      email: "kai.stewart@dailoqa.com",
      role: "System Admin",
      status: "Active",
      initials: "KS",
    },
    {
      name: "Nadia Patel",
      email: "nadia.patel@dailoqa.com",
      role: "HR",
      status: "Active",
      initials: "NP",
    },
    {
      name: "Daniel Ortiz",
      email: "daniel.ortiz@dailoqa.com",
      role: "Mentor",
      status: "Active",
      initials: "DO",
    },
    {
      name: "Alex Morgan",
      email: "alex.morgan@dailoqa.com",
      role: "Employee",
      status: "Active",
      initials: "AM",
    },
    {
      name: "Jordan Lee",
      email: "jordan.lee@dailoqa.com",
      role: "Employee",
      status: "Deactivated",
      initials: "JL",
    },
  ])
  const activeReviewCycle = evaluationCycles.find(
    (cycle) => cycle.status === "Open",
  )
  const employeeReviewCycle = activeReviewCycle?.applicableEmployees.includes(
    "EMP-1042",
  )
    ? { ...activeReviewCycle, publicationStatus: reviewState }
    : null

  const flash = (text: string) => {
    setMessage(text)
    setModal("message")
  }
  const submitReview = () => {
    setReviewState("submitted")
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === "eval-alex"
          ? { ...evaluation, status: "Submitted to HR" }
          : evaluation,
      ),
    )
    flash("Evaluation submitted to HR. Employee visibility remains locked.")
  }
  const publishReview = () => {
    setReviewState("published")
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === "eval-alex"
          ? { ...evaluation, status: "Published" }
          : evaluation,
      ),
    )
    flash("Review published. Alex Morgan can now view ratings and feedback.")
  }
  const requestChanges = () => {
    setReviewState("draft")
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === "eval-alex"
          ? { ...evaluation, status: "Returned by HR" }
          : evaluation,
      ),
    )
    flash("Evaluation returned to Daniel Ortiz for changes.")
  }
  const addUser = () => setModal("addUser")
  const saveUser = () => {
    if (!newName.trim()) return
    const parts = newName.trim().split(" ")
    setUsers((current) => [
      {
        name: newName,
        email: `${parts.join(".").toLowerCase()}@dailoqa.com`,
        role: newRole,
        status: "Active",
        initials: parts
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      },
      ...current,
    ])
    setNewName("")
    setModal(null)
  }
  const updateGoal = (
    goalId: string,
    updates: Partial<EmployeeGoal>,
    progressNote?: string,
  ) => {
    const currentGoal = employeeGoals.find((goal) => goal.id === goalId)
    setEmployeeGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              ...updates,
              latestProgressUpdate: progressNote ?? goal.latestProgressUpdate,
            }
          : goal,
      ),
    )
    if (typeof updates.progress === "number" && currentGoal) {
      setGoalNotification(`${currentGoal.title} moved to ${updates.progress}%.`)
    }
  }
  const addGoal = (goal: EmployeeGoal) =>
    setEmployeeGoals((current) => [...current, goal])
  const deleteGoal = (goalId: string) =>
    setEmployeeGoals((current) =>
      current.filter(
        (goal) => goal.id !== goalId || goal.source === "Mentor assigned",
      ),
    )
  const toEmployeeGoal = (goal: MentorGoal): EmployeeGoal => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    source: "Mentor assigned",
    assignedBy: "Daniel Ortiz",
    startDate: "Today",
    dueDate: goal.dueDate,
    priority: goal.priority,
    progress: goal.progress,
    status:
      goal.status === "Completed"
        ? "Completed"
        : goal.status === "Upcoming"
          ? "Upcoming"
          : goal.status === "Needs attention" || goal.status === "At risk"
            ? "Needs Action"
            : "In Progress",
    relatedTaskIds: [],
    latestProgressUpdate: "Goal assigned by Mentor.",
  })
  const assignMentorGoal = (goal: MentorGoal) => {
    setMentorGoals((current) => [...current, goal])
    if (goal.intern === "Alex Morgan") {
      setEmployeeGoals((current) => [...current, toEmployeeGoal(goal)])
    }
  }
  const updateMentorGoal = (goalId: string, updates: Partial<MentorGoal>) => {
    const existing = mentorGoals.find((goal) => goal.id === goalId)
    if (!existing) return
    const updated = { ...existing, ...updates }
    setMentorGoals((current) =>
      current.map((goal) => (goal.id === goalId ? updated : goal)),
    )
    setEmployeeGoals((current) => {
      const isVisible = current.some((goal) => goal.id === goalId)
      if (
        existing.intern === "Alex Morgan" &&
        updated.intern !== "Alex Morgan"
      ) {
        return current.filter((goal) => goal.id !== goalId)
      }
      if (updated.intern === "Alex Morgan") {
        return isVisible
          ? current.map((goal) =>
              goal.id === goalId
                ? { ...goal, ...toEmployeeGoal(updated) }
                : goal,
            )
          : [...current, toEmployeeGoal(updated)]
      }
      return current
    })
  }
  const updateMentorEvaluation = (
    evaluationId: string,
    updates: Partial<MentorEvaluation>,
  ) => {
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, ...updates }
          : evaluation,
      ),
    )
  }
  const submitMentorEvaluation = (evaluationId: string) => {
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, status: "Submitted to HR" }
          : evaluation,
      ),
    )
    if (evaluationId === "eval-alex") {
      setReviewState("submitted")
      setMessage(
        "Evaluation submitted to HR. Employee visibility remains locked.",
      )
      setModal("message")
    }
  }
  const updateEvaluationStatus = (
    evaluationId: string,
    status: EvaluationStatus,
  ) => {
    setMentorEvaluations((current) =>
      current.map((evaluation) =>
        evaluation.id === evaluationId ? { ...evaluation, status } : evaluation,
      ),
    )
    if (evaluationId === "eval-alex") {
      if (status === "Published") setReviewState("published")
      if (status === "Changes Requested") setReviewState("draft")
      if (
        status === "Submitted to HR" ||
        status === "Pending HR Review" ||
        status === "Approved"
      )
        setReviewState("submitted")
    }
  }
  const unlockEvaluationReview = (evaluationId: string, reason: string) => {
    const evaluation = mentorEvaluations.find(
      (item) => item.id === evaluationId,
    )
    if (!evaluation || !reason.trim()) return
    const timestamp = new Date().toLocaleString()
    setMentorEvaluations((current) =>
      current.map((item) =>
        item.id === evaluationId
          ? { ...item, status: "Re-review required" }
          : item,
      ),
    )
    if (evaluationId === "eval-alex") setReviewState("draft")
    setAuditEvents((current) => [
      {
        id: `audit-review-unlocked-${Date.now()}`,
        event: "Review unlocked",
        person: evaluation.intern,
        time: "Now",
        status: "Review",
        actor: "Kai Stewart",
        role: "System Admin",
        evaluationId,
        reason: reason.trim(),
        timestamp,
        previousStatus: evaluation.status,
      },
      ...current,
    ])
  }
  const createEvaluationCycle = (cycle: ReviewCycle) =>
    setEvaluationCycles((current) => [...current, cycle])
  const updateEvaluationCycle = (
    cycleId: string,
    updates: Partial<ReviewCycle>,
  ) => {
    setEvaluationCycles((current) =>
      current.map((cycle) =>
        cycle.id === cycleId ? { ...cycle, ...updates } : cycle,
      ),
    )
  }
  const saveProgress = () => {
    const progress = Number(progressValue)
    updateGoal(
      progressGoal,
      {
        progress,
        status: progress === 100 ? "Completed" : "In Progress",
      },
      `Progress updated to ${progress}%.`,
    )
    setModal(null)
  }
  const updateTaskProgress = (taskId: string, progress: number) => {
    setEmployeeTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress,
              status:
                task.status === "Completed"
                  ? "Completed"
                  : progress > 0
                    ? "In Progress"
                    : task.status,
            }
          : task,
      ),
    )
  }
  const setTaskCompleted = (taskId: string, completed: boolean) => {
    const task = employeeTasks.find((item) => item.id === taskId)
    setEmployeeTasks((current) =>
      current.map((item) => {
        if (item.id !== taskId) return item
        if (completed) return { ...item, progress: 100, status: "Completed" }
        const initialTask = initialEmployeeTasks.find(
          (initial) => initial.id === taskId,
        )
        return initialTask
          ? {
              ...item,
              progress: initialTask.progress,
              status: initialTask.status,
            }
          : { ...item, status: "In Progress" }
      }),
    )
    if (task && completed !== (task.status === "Completed")) {
      setEmployeeGoals((current) =>
        current.map((goal) => {
          if (goal.id !== task.relatedGoalId) return goal
          const progress = Math.max(
            0,
            Math.min(100, goal.progress + (completed ? 5 : -5)),
          )
          return {
            ...goal,
            progress,
            status:
              progress === 100
                ? "Completed"
                : progress > 0
                  ? "In Progress"
                  : goal.status,
            latestProgressUpdate: completed
              ? `${task.name} completed; goal progress adjusted.`
              : `${task.name} reopened; goal progress adjusted.`,
          }
        }),
      )
    }
    if (completed && task) setTaskNotification(task.name)
  }
  const toggleUser = (email: string) =>
    setUsers((current) =>
      current.map((user) =>
        user.email === email
          ? {
              ...user,
              status: user.status === "Active" ? "Deactivated" : "Active",
            }
          : user,
      ),
    )

  const content = useMemo(() => {
    if (!role) return null
    if (active !== "Dashboard") {
      if (role === "hr" && active === "Performance Overview")
        return <HRPerformanceOverviewPage />
      if (role === "employee")
        return (
          <EmployeePage
            page={active}
            reviewCycle={employeeReviewCycle}
            goals={employeeGoals}
            tasks={employeeTasks}
            addGoal={addGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            updateTaskProgress={updateTaskProgress}
            setTaskCompleted={setTaskCompleted}
          />
        )
      return (
        <ManagementPage
          role={role}
          page={active}
          reviewState={reviewState}
          submitReview={submitReview}
          publishReview={publishReview}
          users={users}
          addUser={addUser}
          toggleUser={toggleUser}
          mentorGoals={mentorGoals}
          assignMentorGoal={assignMentorGoal}
          updateMentorGoal={updateMentorGoal}
          reviewCycle={employeeReviewCycle}
          mentorEvaluations={mentorEvaluations}
          updateMentorEvaluation={updateMentorEvaluation}
          submitMentorEvaluation={submitMentorEvaluation}
          reviewCycles={evaluationCycles}
          createEvaluationCycle={createEvaluationCycle}
          updateEvaluationCycle={updateEvaluationCycle}
          updateEvaluationStatus={updateEvaluationStatus}
          auditEvents={auditEvents}
          unlockEvaluationReview={unlockEvaluationReview}
        />
      )
    }
    if (role === "employee")
      return (
        <EmployeeDashboard
          reviewState={reviewState}
          goals={employeeGoals}
          tasks={employeeTasks}
          setTaskCompleted={setTaskCompleted}
          openProgress={() => setModal("progress")}
          navigate={setActive}
        />
      )
    if (role === "mentor")
      return (
        <MentorDashboard
          reviewState={reviewState}
          onSubmit={submitReview}
          navigate={setActive}
        />
      )
    if (role === "hr")
      return (
        <HRDashboard
          cycles={evaluationCycles}
          evaluations={mentorEvaluations}
          updateEvaluationStatus={updateEvaluationStatus}
          createCycle={createEvaluationCycle}
          updateCycle={updateEvaluationCycle}
          navigate={setActive}
        />
      )
    return (
      <AdminDashboard users={users} addUser={addUser} navigate={setActive} />
    )
  }, [
    role,
    active,
    reviewState,
    users,
    employeeReviewCycle,
    employeeTasks,
    employeeGoals,
    mentorGoals,
    mentorEvaluations,
    evaluationCycles,
    auditEvents,
  ])

  if (!role)
    return (
      <Login
        onLogin={(nextRole) => {
          setRole(nextRole)
          setActive("Dashboard")
        }}
      />
    )

  return (
    <>
      <AppShell
        role={role}
        active={active}
        setActive={setActive}
        onLogout={() => {
          setRole(null)
          setActive("Dashboard")
        }}
        taskNotification={taskNotification}
        goalNotification={goalNotification}
      >
        {content}
      </AppShell>
      {modal === "message" && (
        <Modal onClose={() => setModal(null)}>
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-green-100 text-green-700">
            <Icon name="check" />
          </div>
          <div className="mt-5 text-center text-xl font-semibold">
            Action complete
          </div>
          <div className="mt-2 text-center text-sm leading-6 text-muted">
            {message}
          </div>
          <Button
            className="mt-6 w-full justify-center"
            onClick={() => setModal(null)}
          >
            Continue
          </Button>
        </Modal>
      )}
      {modal === "addUser" && (
        <Modal onClose={() => setModal(null)}>
          <SectionTitle title="Add a user" eyebrow="User management" />
          <div className="space-y-4">
            <label className="block">
              <span className="field-label">Full name</span>
              <TextInput
                value={newName}
                onChange={setNewName}
                placeholder="e.g. Jamie Chen"
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="field-label">Role</span>
              <Select
                value={newRole}
                onChange={setNewRole}
                ariaLabel="Select role"
              >
                <option>Employee</option>
                <option>Mentor</option>
                <option>HR</option>
                <option>System Admin</option>
              </Select>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={saveUser}>Create user</Button>
          </div>
        </Modal>
      )}
      {modal === "progress" && (
        <Modal onClose={() => setModal(null)}>
          <SectionTitle title="Update progress" eyebrow="Employee goals" />
          <div className="space-y-4">
            <label className="block">
              <span className="field-label">Goal</span>
              <Select
                value={progressGoal}
                onChange={(value) => {
                  setProgressGoal(value)
                  setProgressValue(
                    String(
                      employeeGoals.find((goal) => goal.id === value)
                        ?.progress ?? 0,
                    ),
                  )
                }}
                ariaLabel="Select goal"
              >
                {employeeGoals.slice(0, 3).map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="field-label">Progress</span>
              <Select
                value={progressValue}
                onChange={setProgressValue}
                ariaLabel="Select progress"
              >
                {[25, 35, 43, 50, 58, 65, 76, 80, 90, 100].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={saveProgress}>Save progress</Button>
          </div>
        </Modal>
      )}
    </>
  )
}
