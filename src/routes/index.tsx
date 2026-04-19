import { createFileRoute } from '@tanstack/react-router';
import OllieBirdGameComponent from '../components/OllieBirdGameComponent';

export const Route = createFileRoute('/')({
	component: Page,
});

function Page() {
	return <OllieBirdGameComponent />;
}
