import Instances from "@/Components/Dasboard/Instances";
import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <AppLayout user={auth.user}>
            <Head title="Dashboard" />
        <Instances/>
           
        </AppLayout>
    );
}
