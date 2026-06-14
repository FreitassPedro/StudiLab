import { TodaySummarySkeleton, RecentSessionsSkeleton, SkeletonBoxComponent } from "./components/Skeletons";

export default function DashboardLoading() {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="space-y-2">
                <SkeletonBoxComponent className="h-9 w-48" />
                <SkeletonBoxComponent className="h-4 w-80 max-w-full" />
            </div>

            <TodaySummarySkeleton />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <RecentSessionsSkeleton />

                <div className="rounded-lg border border-border/40 p-4">
                    <div className="space-y-2 mb-4">
                        <SkeletonBoxComponent className="h-6 w-56" />
                        <SkeletonBoxComponent className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <SkeletonBoxComponent key={i} className="h-8 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
