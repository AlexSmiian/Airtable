import Table from "@/features/Table/components/Table";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export default function Home() {
    return (
        <main>
            <ReactQueryProvider>
                <Table />
            </ReactQueryProvider>
        </main>
    );
}
