import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export function TodaySummarySkeleton() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <SkeletonBox className="h-5 w-36" />
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <SkeletonBox className="h-9 w-9 rounded" />
                            <div className="space-y-2">
                                <SkeletonBox className="h-7 w-24" />
                                <SkeletonBox className="h-4 w-28" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function RecentSessionsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <SkeletonBox className="h-5 w-44" />
            </CardHeader>
            <CardContent className="space-y-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-border/40 rounded-lg">
                        <SkeletonBox className="w-1.5 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <SkeletonBox className="h-4 w-48" />
                                <SkeletonBox className="h-4 w-24" />
                            </div>
                            <SkeletonBox className="h-3 w-full" />
                            <SkeletonBox className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function SkeletonBoxComponent({ className }: { className?: string }) {
    return <SkeletonBox className={className} />;
}
