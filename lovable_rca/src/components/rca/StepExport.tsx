import { FileDown, FileSpreadsheet, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Store, AdjustmentFactors } from '@/types/rca';

interface StepExportProps {
  subjectStore: Store | null;
  selectedStores: Store[];
  adjustmentFactors: AdjustmentFactors;
  onExport: () => void;
  isLoading: boolean;
  onBack: () => void;
}

export function StepExport({ 
  subjectStore, 
  selectedStores, 
  adjustmentFactors, 
  onExport, 
  isLoading, 
  onBack 
}: StepExportProps) {
  const totalAdjustment = 
    (adjustmentFactors.captiveMarketPremium || 0) + 
    (adjustmentFactors.lossToLease || 0) + 
    (adjustmentFactors.ccAdj || 0);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Export Analysis</h2>
        <p className="text-muted-foreground">
          Review your configuration and generate CSV reports
        </p>
      </div>

      {/* Analysis Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Subject Store</h4>
                <p className="font-medium">{subjectStore?.storeName || 'Not selected'}</p>
                {subjectStore && (
                  <p className="text-sm text-muted-foreground">
                    {subjectStore.address}, {subjectStore.city}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Competitors</h4>
                <p className="font-medium">{selectedStores.length - 1} stores</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedStores.slice(1, 5).map((store) => (
                    <Badge key={store.storeId} variant="outline" className="text-xs">
                      {store.storeName.split(' - ')[0]}
                    </Badge>
                  ))}
                  {selectedStores.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedStores.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Analysis Period</h4>
                <p className="font-medium">Trailing 12 Months</p>
                <p className="text-sm text-muted-foreground">Dec 1, 2024 - Present</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Adjustment</h4>
                <p className="font-medium font-mono">{totalAdjustment.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">
                  Captive: {adjustmentFactors.captiveMarketPremium}% • 
                  LTL: {adjustmentFactors.lossToLease}% • 
                  CC: {adjustmentFactors.ccAdj}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Export Files
          </CardTitle>
          <CardDescription>
            Two CSV files will be generated for your analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-primary/10">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">CSV 1: Full Data Dump</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete rate records with all unit details, features, prices, and dates.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">Store Name</Badge>
                  <Badge variant="outline" className="text-xs">Unit Size</Badge>
                  <Badge variant="outline" className="text-xs">Walk-in Price</Badge>
                  <Badge variant="outline" className="text-xs">Online Price</Badge>
                  <Badge variant="outline" className="text-xs">Features</Badge>
                  <Badge variant="outline" className="text-xs">Date</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-primary/10">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">CSV 2: Summary Report</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Grouped averages by unit size and tag with monthly and T-period calculations.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">Monthly Averages</Badge>
                  <Badge variant="outline" className="text-xs">T-12 / T-6 / T-3 / T-1</Badge>
                  <Badge variant="outline" className="text-xs">Adjusted Prices</Badge>
                  <Badge variant="outline" className="text-xs">Competitor Breakdown</Badge>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={onExport} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Reports...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV Reports
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Start New Analysis
        </Button>
      </div>
    </div>
  );
}
