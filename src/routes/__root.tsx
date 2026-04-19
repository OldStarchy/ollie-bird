import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { NoPrint } from '../components/util/NoPrint';

function Page() {
	return (
		<>
			<Outlet />

			{import.meta.env.DEV ? (
				<NoPrint>
					<TanStackRouterDevtools position="bottom-right" />
				</NoPrint>
			) : null}
		</>
	);
}

export const Route = createRootRoute({
	component: Page,
});
