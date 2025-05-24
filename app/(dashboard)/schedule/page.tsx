import Schedule from "./schedule";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function SchedulePage() {
  return (
    <AuthGuard>
      <Schedule />
    </AuthGuard>
  );
} 