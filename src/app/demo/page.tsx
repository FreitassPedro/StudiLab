import type { Metadata } from "next";
import { DemoContent } from "./DemoContent";

export const metadata: Metadata = {
    title: "Demo — StudiLab | Veja como funciona",
    description: "Explore o StudiLab sem precisar criar uma conta. Veja dashboards, gráficos de progresso, ranking de amigos e muito mais.",
};

export default function DemoPage() {
    return <DemoContent />;
}
