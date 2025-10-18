import Groups from "@/Components/Dasboard/Groups";
import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";

export default function GroupsPanel({ auth, instance, groups }) {
    return (
        <AppLayout user={auth.user}>
            <Head title="Groups" />
            <Groups instance={instance} groups={groups} />
        </AppLayout>
    );
}
