
import { LogSection } from "./SidebarLogs";
import { TodaySummaryMini } from "./TodaySummaryMini";

export function SessionSidebar() {

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full border-l border-border">
            {/* Header - Hidden on mobile (shown in toggle) */}
            <div className="hidden lg:block p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Informações</h2>
            </div>

            {/* Conteúdo do Sidebar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-10">
                {/* Resumo de Hoje */}
                <TodaySummaryMini />

                {/* Últimos Logs */}
                <LogSection type="subject" />

                <LogSection type="topic" />

                {/* Tasks da Matéria (Em desenvolvimento) 
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <span>Tasks da Matéria</span>
                    </div>
                    <Separator className="my-2" />

                    <Card className="p-3 space-y-2 bg-muted/50 border-none">
                        <div className="text-xs text-muted-foreground">Nenhuma task</div>
                        <div className="text-sm text-muted-foreground">
                            Crie tasks para organizar seus estudos
                        </div>
                    </Card>
                </div>
                */}
            </div >
        </div >
    );
};