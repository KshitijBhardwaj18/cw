import { EditPerDiemShiftPageContent } from "@/components/shifts/EditPerDiemShiftPageContent";

interface EditShiftPageProps {
	params: Promise<{ shiftId: string }>;
}

export default async function EditShiftPage({ params }: EditShiftPageProps) {
	const { shiftId } = await params;
	return <EditPerDiemShiftPageContent shiftId={shiftId} />;
}
