import { Building2, Calendar, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Store, StoreMetadata } from '@/types/rca';

interface StepMetadataProps {
  stores: Store[];
  metadata: Record<number, StoreMetadata>;
  onUpdate: (storeId: number, data: Partial<StoreMetadata>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepMetadata({ stores, metadata, onUpdate, onNext, onBack }: StepMetadataProps) {
  const formatNumber = (value: number | null): string => {
    if (value === null) return '';
    return value.toLocaleString();
  };

  const parseNumber = (value: string): number | null => {
    const num = parseInt(value.replace(/,/g, ''), 10);
    return isNaN(num) ? null : num;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Store Metadata</h2>
        <p className="text-muted-foreground">
          Enter Year Built and Square Footage for each store
        </p>
      </div>

      <div className="space-y-4">
        {stores.map((store, index) => {
          const storeMeta = metadata[store.storeId] || { yearBuilt: null, squareFootage: null };
          const isSubject = index === 0;
          
          return (
            <Card key={store.storeId} className={isSubject ? 'border-primary/30' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {isSubject && <Badge variant="default">Subject</Badge>}
                  {!isSubject && <Badge variant="outline">Competitor {index}</Badge>}
                  <span className="text-sm text-muted-foreground">ID: {store.storeId}</span>
                </div>
                <CardTitle className="text-base">{store.storeName}</CardTitle>
                <CardDescription>{store.address}, {store.city}, {store.state}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`year-${store.storeId}`} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Year Built
                    </Label>
                    <Input
                      id={`year-${store.storeId}`}
                      type="number"
                      min="1900"
                      max="2030"
                      placeholder="e.g., 2015"
                      value={storeMeta.yearBuilt || ''}
                      onChange={(e) => onUpdate(store.storeId, { yearBuilt: parseNumber(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`sf-${store.storeId}`} className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      Square Footage
                    </Label>
                    <Input
                      id={`sf-${store.storeId}`}
                      type="text"
                      placeholder="e.g., 75,000"
                      value={formatNumber(storeMeta.squareFootage)}
                      onChange={(e) => onUpdate(store.storeId, { squareFootage: parseNumber(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Rankings
        </Button>
      </div>
    </div>
  );
}
