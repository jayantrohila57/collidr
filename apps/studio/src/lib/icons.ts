import { Github } from "@loftlancer/ui/github-icon";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Folder,
  FolderKanban,
  Globe,
  KeyRound,
  Layers,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Mail,
  MoreHorizontal,
  MoreVertical,
  PauseCircle,
  Pencil,
  Plus,
  Power,
  SearchX,
  Settings,
  ShieldAlert,
  Trash2,
  User,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";

/** Default Lucide sizing and tone for inline UI icons (coss `gap-2` pairs). */
export const iconMutedClassName = "size-4 shrink-0 text-muted-foreground";

/**
 * Canonical icon per product concept — import icons only through this map
 * (or `AppIcon`) so the same concept always renders the same glyph.
 */
export const appIcons = {
  project: FolderKanban,
  projectFolder: Folder,
  environment: Layers,
  layoutGrid: LayoutGrid,
  listView: List,
  variable: KeyRound,
  member: Users,
  user: User,
  invite: UserPlus,
  organization: Building2,
  settings: Settings,
  danger: ShieldAlert,
  activity: Activity,
  bell: Bell,
  searchEmpty: SearchX,
  mail: Mail,
  plus: Plus,
  edit: Pencil,
  delete: Trash2,
  copy: Copy,
  reveal: Eye,
  hide: EyeOff,
  lock: Lock,
  globe: Globe,
  github: Github,
  externalLink: ExternalLink,
  rowActions: MoreVertical,
  rowActionsAlt: MoreHorizontal,
  calendar: Calendar,
  statusActive: Circle,
  statusInactive: PauseCircle,
  statusMaintenance: Wrench,
  statusArchived: Archive,
  power: Power,
  archiveRestore: ArchiveRestore,
  back: ChevronLeft,
  chevronRight: ChevronRight,
  arrowLeft: ArrowLeft,
  logOut: LogOut,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof appIcons;

export function getAppIcon(name: AppIconName): LucideIcon {
  return appIcons[name];
}
