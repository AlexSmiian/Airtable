import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import {TableUpdateProvider} from "@/features/Table/context/TableUpdateContext";
import TableContent from "@/features/Table/components/Table";

export default function Home() {
    return (
        <main>
            <ReactQueryProvider>
                <TableUpdateProvider>
                    <TableContent/>
                </TableUpdateProvider>
            </ReactQueryProvider>
        </main>
    );
}
