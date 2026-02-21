import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const tips = [
  "Keep your screen at arm's length and eye level",
  "Feet should be flat on the floor, knees at 90°",
  "Relax your shoulders — avoid hunching",
  "Take a 5-minute break every 30 minutes",
];

const ErgonomicTips = () => {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-warning" />
          Ergonomic Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ErgonomicTips;
