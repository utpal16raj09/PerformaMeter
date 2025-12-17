import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { downloadJSON, downloadCSV, downloadPDF } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/use-toast';

export default function ExportButton({ data, filename, title }) {
  const { toast } = useToast();

  const handleExport = (type) => {
    try {
      if (!data) {
        toast({
          title: "Export Failed",
          description: "No data available to export.",
          variant: "destructive"
        });
        return;
      }

      // Flatten data if needed or use as is
      const exportData = Array.isArray(data) ? data : [data];

      if (type === 'json') {
        downloadJSON(exportData, filename);
      } else if (type === 'csv') {
        downloadCSV(exportData, filename);
      } else if (type === 'pdf') {
        downloadPDF(exportData, title || filename, filename);
      }

      toast({
        title: "Export Successful",
        description: `Data exported as ${type.toUpperCase()}`,
        variant: "success" // Assuming success variant or default
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Export Failed",
        description: "An error occurred during export.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Export CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}