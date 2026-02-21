import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportSessionsCSV, exportSnapshotsCSV, generatePDFReport } from "@/lib/exportData";
import { useToast } from "@/hooks/use-toast";

const ExportMenu = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async (fn: () => Promise<void>, label: string) => {
    setLoading(true);
    try {
      await fn();
      toast({ title: "Export complete", description: `${label} downloaded successfully.` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(exportSessionsCSV, "Sessions CSV")}>
          <Table className="mr-2 h-4 w-4" />
          Sessions CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(exportSnapshotsCSV, "Snapshots CSV")}>
          <Table className="mr-2 h-4 w-4" />
          Snapshots CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(generatePDFReport, "PDF Report")}>
          <FileText className="mr-2 h-4 w-4" />
          PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
