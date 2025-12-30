import './App.css';
import Layout from './components/layouts/Layout';
import OllieBirdGameComponent from './components/OllieBirdGameComponent';

function App() {
	return (
		<Layout style={{ width: '100vw', height: '100vh' }}>
			<OllieBirdGameComponent />
		</Layout>
	);
}

export default App;
