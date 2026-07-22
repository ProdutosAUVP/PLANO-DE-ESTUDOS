import {
  BarChart3,
  Brain,
  Gem,
  Globe,
  GraduationCap,
  PiggyBank,
  Receipt,
  Rocket,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

/** Ícone por módulo (DS: Grade Curricular — tile bg-accent/10 + ícone lucide). */
export const MODULE_ICONS: Record<string, typeof Brain> = {
  m1: Brain,
  m2: Wallet,
  m3: PiggyBank,
  m4: TrendingUp,
  m5: Gem,
  m6: Globe,
  m7: Rocket,
  "bonus-ir": Receipt,
  "bonus-indicadores": BarChart3,
  "bonus-masterclasses": GraduationCap,
};

export function getModuleIcon(moduleId: string): typeof Brain {
  return MODULE_ICONS[moduleId] ?? Sparkles;
}
