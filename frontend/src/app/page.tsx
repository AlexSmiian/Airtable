import Index from "@/features/Table/components/Table";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export default function Home() {
    return (
        <main>
            <ReactQueryProvider>
                <Index />
            </ReactQueryProvider>
        </main>
    );
}
