import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateRecordPayload {
    id: number;
    field: string;
    value: any;
}

export const useUpdateRecord = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, UpdateRecordPayload>({
        mutationFn: async ({ id, field, value }) => {
            const res = await fetch(`/api/records/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });
            if (!res.ok) throw new Error("Failed to update record");
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tableData"] }),
    });
};
