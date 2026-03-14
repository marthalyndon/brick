import {
  Waves,
  Bike,
  PersonStanding,
  Dumbbell,
  Layers,
  Moon,
  Activity,
} from "lucide-react";
import { type WorkoutType } from "@/generated/prisma/client";

interface SportIconProps {
  type: WorkoutType;
  className?: string;
}

export function SportIcon({ type, className = "size-4" }: SportIconProps) {
  switch (type) {
    case "SWIM":     return <Waves className={className} />;
    case "BIKE":     return <Bike className={className} />;
    case "RUN":      return <PersonStanding className={className} />;
    case "STRENGTH": return <Dumbbell className={className} />;
    case "BRICK":    return <Layers className={className} />;
    case "REST":     return <Moon className={className} />;
    default:         return <Activity className={className} />;
  }
}
